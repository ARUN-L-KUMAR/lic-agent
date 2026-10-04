"""Admin API — content and customer management for agents/admins.

Everything here requires the agent or admin role. Content (FAQs, testimonials, blog posts,
documents) is entered by the agent; nothing is pre-filled or invented.
"""
import hashlib
import re
import uuid
from datetime import date, datetime, timezone
from enum import Enum
from typing import Any, List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile, status
from pydantic import BaseModel
from sqlalchemy import Boolean, DateTime, Integer, JSON, String, Text, func, or_, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, require_agent
from app.models.blog import BlogPost, PostStatus
from app.models.conversation import Conversation, ConversationStatus, Message, MessageType
from app.models.document import Document, DocumentType, DocumentVisibility
from app.models.faq import FAQ
from app.models.plan import Plan
from app.models.site_settings import SiteSettings
from app.models.testimonial import Testimonial
from app.models.user import AgentProfile, User, UserRole
from app.services.storage_service import StorageService

router = APIRouter()


# ── Generic helpers ──────────────────────────────────────────

def _jsonable(value: Any) -> Any:
    if isinstance(value, (uuid.UUID,)):
        return str(value)
    if isinstance(value, (datetime, date)):
        return value.isoformat()
    if isinstance(value, Enum):
        return value.value
    return value


def _row(obj: Any, exclude: tuple = ()) -> dict:
    return {
        c.name: _jsonable(getattr(obj, c.name))
        for c in obj.__table__.columns
        if c.name not in exclude
    }


def _coerce(model, data: dict, fields: tuple) -> dict:
    """Keep only whitelisted fields and convert them to the column's Python type."""
    out = {}
    for name in fields:
        if name not in data:
            continue
        value = data[name]
        col = model.__table__.columns[name]
        if value == "" and col.nullable:
            value = None
        elif value is not None:
            if isinstance(col.type, Boolean):
                value = bool(value)
            elif isinstance(col.type, Integer):
                value = int(value)
            elif isinstance(col.type, DateTime):
                value = datetime.fromisoformat(str(value).replace("Z", "+00:00"))
            elif isinstance(col.type, JSON) and isinstance(value, str):
                value = [v.strip() for v in value.split(",") if v.strip()]
            elif hasattr(col.type, "enum_class") and col.type.enum_class is not None:
                try:
                    value = col.type.enum_class[str(value).upper()]
                except KeyError:
                    raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, f"Invalid {name}")
        out[name] = value
    return out


def _slugify(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")[:300] or uuid.uuid4().hex[:8]


async def _list(db: AsyncSession, model, page: int, per_page: int, search: Optional[str], search_cols, order):
    query, count_q = select(model), select(func.count()).select_from(model)
    if search:
        cond = or_(*[getattr(model, c).ilike(f"%{search}%") for c in search_cols])
        query, count_q = query.where(cond), count_q.where(cond)
    total = (await db.execute(count_q)).scalar_one()
    rows = (await db.execute(query.order_by(*order).offset((page - 1) * per_page).limit(per_page))).scalars().all()
    return {"items": [_row(r) for r in rows], "total": total, "page": page, "per_page": per_page}


async def _get_or_404(db: AsyncSession, model, item_id: UUID):
    obj = await db.get(model, item_id)
    if obj is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Not found")
    return obj


async def _commit(db: AsyncSession) -> None:
    try:
        await db.commit()
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status.HTTP_409_CONFLICT, "An entry with the same unique value (e.g. slug) already exists")


def _register_crud(name: str, model, fields: tuple, search_cols: tuple, order, before_create=None):
    """Registers GET/POST/PUT/DELETE /admin/<name> for a model, restricted to `fields`."""

    @router.get(f"/{name}", name=f"admin_list_{name}")
    async def list_items(
        page: int = Query(1, ge=1),
        per_page: int = Query(50, ge=1, le=100),
        search: Optional[str] = None,
        db: AsyncSession = Depends(get_db),
        _: User = Depends(require_agent),
    ):
        return await _list(db, model, page, per_page, search, search_cols, order)

    @router.post(f"/{name}", status_code=status.HTTP_201_CREATED, name=f"admin_create_{name}")
    async def create_item(
        payload: dict,
        db: AsyncSession = Depends(get_db),
        user: User = Depends(require_agent),
    ):
        values = _coerce(model, payload, fields)
        if before_create:
            before_create(values, user)
        obj = model(**values)
        db.add(obj)
        await _commit(db)
        await db.refresh(obj)
        return _row(obj)

    @router.put(f"/{name}/{{item_id}}", name=f"admin_update_{name}")
    async def update_item(
        item_id: UUID,
        payload: dict,
        db: AsyncSession = Depends(get_db),
        _: User = Depends(require_agent),
    ):
        obj = await _get_or_404(db, model, item_id)
        for k, v in _coerce(model, payload, fields).items():
            setattr(obj, k, v)
        if model is BlogPost and obj.status == PostStatus.PUBLISHED and obj.published_at is None:
            obj.published_at = datetime.now(timezone.utc)
        await _commit(db)
        await db.refresh(obj)
        return _row(obj)

    @router.delete(f"/{name}/{{item_id}}", status_code=status.HTTP_204_NO_CONTENT, name=f"admin_delete_{name}")
    async def delete_item(
        item_id: UUID,
        db: AsyncSession = Depends(get_db),
        _: User = Depends(require_agent),
    ):
        await db.delete(await _get_or_404(db, model, item_id))
        await db.commit()


def _prepare_post(values: dict, user: User) -> None:
    if not values.get("title") or not values.get("content"):
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "Title and content are required")
    values["slug"] = _slugify(values.get("slug") or values["title"])
    values["author_id"] = user.id
    if values.get("status") == PostStatus.PUBLISHED:
        values["published_at"] = datetime.now(timezone.utc)


def _require(*names):
    def check(values: dict, _user: User) -> None:
        missing = [n for n in names if not values.get(n)]
        if missing:
            raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, f"Required: {', '.join(missing)}")
    return check


_register_crud(
    "faqs", FAQ,
    ("question", "answer", "category", "display_order", "is_published", "include_in_ai"),
    ("question", "answer"), (FAQ.display_order, FAQ.created_at),
    before_create=_require("question", "answer"),
)
_register_crud(
    "testimonials", Testimonial,
    ("name", "location", "content", "rating", "plan_name", "is_published", "display_order"),
    ("name", "content"), (Testimonial.display_order, Testimonial.created_at.desc()),
    before_create=_require("name", "content"),
)
_register_crud(
    "blog", BlogPost,
    ("title", "slug", "excerpt", "content", "tags", "status", "seo_title", "seo_description"),
    ("title", "excerpt"), (BlogPost.created_at.desc(),),
    before_create=_prepare_post,
)


# ── Plans (read side; create/update/status use the /plans API) ──

@router.get("/plans")
async def list_all_plans(
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=100),
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_agent),
):
    """All plans including drafts and archived ones (the public list only shows published)."""
    return await _list(db, Plan, page, per_page, search, ("name", "plan_code"), (Plan.display_order, Plan.name))


# ── Customers ────────────────────────────────────────────────

@router.get("/customers")
async def list_customers(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_agent),
):
    query = select(User).where(User.role == UserRole.CUSTOMER)
    count_q = select(func.count()).select_from(User).where(User.role == UserRole.CUSTOMER)
    if search:
        cond = or_(
            User.first_name.ilike(f"%{search}%"),
            User.last_name.ilike(f"%{search}%"),
            User.email.ilike(f"%{search}%"),
            User.phone.ilike(f"%{search}%"),
        )
        query, count_q = query.where(cond), count_q.where(cond)
    total = (await db.execute(count_q)).scalar_one()
    rows = (
        await db.execute(query.order_by(User.created_at.desc()).offset((page - 1) * per_page).limit(per_page))
    ).scalars().all()
    items = [
        {
            "id": str(u.id), "first_name": u.first_name, "last_name": u.last_name, "email": u.email,
            "phone": u.phone, "is_active": u.is_active, "is_verified": u.is_verified,
            "created_at": u.created_at.isoformat(),
        }
        for u in rows
    ]
    return {"items": items, "total": total, "page": page, "per_page": per_page}


class ActiveToggle(BaseModel):
    is_active: bool


@router.patch("/customers/{user_id}")
async def set_customer_active(
    user_id: UUID,
    payload: ActiveToggle,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_agent),
):
    user = await db.get(User, user_id)
    if user is None or user.role != UserRole.CUSTOMER:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Customer not found")
    user.is_active = payload.is_active
    await db.commit()
    return {"id": str(user.id), "is_active": user.is_active}


# ── Live chats ───────────────────────────────────────────────

@router.get("/conversations")
async def list_conversations(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    status_filter: Optional[str] = Query(None, alias="status"),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_agent),
):
    query = select(Conversation, User).join(User, User.id == Conversation.customer_id)
    count_q = select(func.count()).select_from(Conversation)
    if status_filter:
        try:
            st = ConversationStatus[status_filter.upper()]
        except KeyError:
            raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "Invalid status")
        query, count_q = query.where(Conversation.status == st), count_q.where(Conversation.status == st)
    total = (await db.execute(count_q)).scalar_one()
    rows = (
        await db.execute(
            query.order_by(func.coalesce(Conversation.last_message_at, Conversation.created_at).desc())
            .offset((page - 1) * per_page).limit(per_page)
        )
    ).all()
    items = [
        {
            "id": str(c.id), "customer_name": f"{u.first_name} {u.last_name}", "customer_phone": u.phone,
            "status": c.status.value, "source": c.source.value, "customer_goal": c.customer_goal,
            "ai_summary": c.ai_summary, "agent_unread": c.agent_unread,
            "last_message_at": _jsonable(c.last_message_at), "created_at": c.created_at.isoformat(),
        }
        for c, u in rows
    ]
    return {"items": items, "total": total, "page": page, "per_page": per_page}


@router.get("/conversations/{conversation_id}/messages")
async def conversation_messages(
    conversation_id: UUID,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_agent),
):
    conv = await _get_or_404(db, Conversation, conversation_id)
    rows = (
        await db.execute(
            select(Message).where(Message.conversation_id == conv.id).order_by(Message.created_at)
        )
    ).scalars().all()
    if conv.agent_unread:
        conv.agent_unread = 0
        await db.commit()
    return {
        "items": [
            {
                "id": str(m.id), "from_customer": m.sender_id == conv.customer_id,
                "message_type": m.message_type.value, "content": m.content,
                "created_at": m.created_at.isoformat(),
            }
            for m in rows
        ]
    }


class ChatReply(BaseModel):
    content: str


@router.post("/conversations/{conversation_id}/messages", status_code=status.HTTP_201_CREATED)
async def reply_to_conversation(
    conversation_id: UUID,
    payload: ChatReply,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_agent),
):
    content = payload.content.strip()
    if not content:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "Message is empty")
    conv = await _get_or_404(db, Conversation, conversation_id)
    msg = Message(conversation_id=conv.id, sender_id=user.id, message_type=MessageType.TEXT, content=content)
    db.add(msg)
    conv.agent_id = conv.agent_id or user.id
    conv.customer_unread = (conv.customer_unread or 0) + 1
    conv.last_message_at = datetime.now(timezone.utc)
    if conv.status == ConversationStatus.PENDING:
        conv.status = ConversationStatus.ACTIVE
    await db.commit()
    return {"id": str(msg.id), "content": msg.content, "created_at": msg.created_at.isoformat()}


class ConversationStatusUpdate(BaseModel):
    status: str


@router.patch("/conversations/{conversation_id}")
async def set_conversation_status(
    conversation_id: UUID,
    payload: ConversationStatusUpdate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_agent),
):
    conv = await _get_or_404(db, Conversation, conversation_id)
    try:
        conv.status = ConversationStatus[payload.status.upper()]
    except KeyError:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "Invalid status")
    await db.commit()
    return {"id": str(conv.id), "status": conv.status.value}


# ── Documents ────────────────────────────────────────────────

_DOC_TYPES = {
    "application/pdf": DocumentType.PDF,
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": DocumentType.DOCX,
    "text/plain": DocumentType.TXT,
}


@router.get("/documents")
async def list_documents(
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=100),
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_agent),
):
    return await _list(db, Document, page, per_page, search, ("original_filename", "title"), (Document.created_at.desc(),))


@router.post("/documents", status_code=status.HTTP_201_CREATED)
async def upload_document(
    file: UploadFile = File(...),
    title: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    visibility: str = Form("INTERNAL"),
    include_in_ai: bool = Form(False),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_agent),
):
    try:
        vis = DocumentVisibility[visibility.upper()]
    except KeyError:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "Invalid visibility")
    data = await file.read()
    await file.seek(0)
    storage = StorageService()
    url = await storage.upload_document(file)  # validates the file type
    doc = Document(
        filename=url.rsplit("/", 1)[-1],
        original_filename=file.filename or "document",
        doc_type=_DOC_TYPES.get(file.content_type or "", DocumentType.OTHER),
        mime_type=file.content_type or "application/octet-stream",
        size_bytes=len(data),
        storage_url=url,
        checksum=hashlib.sha256(data).hexdigest(),
        title=title or None,
        description=description or None,
        uploaded_by=user.id,
        visibility=vis,
        include_in_ai=include_in_ai,
    )
    db.add(doc)
    await db.commit()
    await db.refresh(doc)
    return _row(doc)


@router.delete("/documents/{doc_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(
    doc_id: UUID,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_agent),
):
    await db.delete(await _get_or_404(db, Document, doc_id))
    await db.commit()


# ── Site settings ────────────────────────────────────────────

SETTINGS_FIELDS = (
    "business_name", "agent_name", "agent_code", "license_number", "phone", "whatsapp", "email",
    "office_address", "profile_image_url", "hero_image_url", "working_hours", "about_text", "tagline", "hero_headline", "hero_subtext",
    "years_experience", "customers_served", "plans_supported", "service_locations",
    "site_title", "site_description", "site_keywords",
    "main_disclaimer", "insurance_disclaimer", "ai_disclaimer", "calculator_disclaimer",
)


@router.get("/site-settings")
async def get_site_settings(db: AsyncSession = Depends(get_db), _: User = Depends(require_agent)):
    row = (await db.execute(select(SiteSettings).limit(1))).scalar_one_or_none()
    return {f: getattr(row, f, None) for f in SETTINGS_FIELDS}


@router.put("/site-settings")
async def update_site_settings(
    payload: dict,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_agent),
):
    row = (await db.execute(select(SiteSettings).limit(1))).scalar_one_or_none()
    if row is None:
        row = SiteSettings()
        db.add(row)
    for k, v in _coerce(SiteSettings, payload, SETTINGS_FIELDS).items():
        setattr(row, k, v)
    if not row.agent_name or not row.business_name:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "Business name and agent name are required")

    # Keep the public agent profile (About page) in sync with the contact details.
    agent = (
        await db.execute(select(User).where(User.role == UserRole.AGENT).order_by(User.created_at).limit(1))
    ).scalar_one_or_none()
    if agent is not None:
        profile = (
            await db.execute(select(AgentProfile).where(AgentProfile.user_id == agent.id))
        ).scalar_one_or_none()
        if profile is not None:
            profile.agent_code = row.agent_code or None
            profile.office_phone = row.phone
            profile.office_address = row.office_address
            profile.bio = row.about_text
            profile.profile_image = row.profile_image_url
    await db.commit()
    return {f: getattr(row, f, None) for f in SETTINGS_FIELDS}


@router.get("/stats")
async def admin_stats(_: User = Depends(require_agent)):
    return {"status": "ok"}
