"""Appointments API — customers book and view their own; agents/admins manage all."""
from datetime import datetime, timezone
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import get_current_user, get_db
from app.core.config import settings
from app.models.appointment import Appointment, AppointmentStatus, MeetingType
from app.models.user import User, UserRole
from app.services.email_service import EmailService

router = APIRouter()


class AppointmentCreate(BaseModel):
    requested_date: datetime
    meeting_type: str = "PHONE"
    purpose: Optional[str] = Field(None, max_length=500)
    notes: Optional[str] = Field(None, max_length=2000)


class AppointmentUpdate(BaseModel):
    status: Optional[str] = None
    confirmed_date: Optional[datetime] = None
    agent_notes: Optional[str] = Field(None, max_length=2000)
    meeting_link: Optional[str] = Field(None, max_length=1024)


def _serialize(a: Appointment) -> dict:
    c = a.customer
    return {
        "id": str(a.id),
        "customer_name": f"{c.first_name} {c.last_name}" if c else None,
        "customer_phone": c.phone if c else None,
        "customer_email": c.email if c else None,
        "requested_date": a.requested_date.isoformat(),
        "confirmed_date": a.confirmed_date.isoformat() if a.confirmed_date else None,
        "meeting_type": a.meeting_type.name,
        "status": a.status.name,
        "purpose": a.purpose,
        "notes": a.notes,
        "agent_notes": a.agent_notes,
        "meeting_link": a.meeting_link,
        "created_at": a.created_at.isoformat(),
    }


def _is_staff(user: User) -> bool:
    return user.role in (UserRole.AGENT, UserRole.ADMIN)


def _parse_enum(enum_cls, value: str, label: str):
    try:
        return enum_cls[value.upper().replace(" ", "_")]
    except KeyError:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, f"Invalid {label}")


@router.get("")
async def list_appointments(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    status_filter: Optional[str] = Query(None, alias="status"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    query = select(Appointment).options(selectinload(Appointment.customer))
    count_q = select(func.count()).select_from(Appointment)
    if not _is_staff(current_user):
        query = query.where(Appointment.customer_id == current_user.id)
        count_q = count_q.where(Appointment.customer_id == current_user.id)
    if status_filter:
        st = _parse_enum(AppointmentStatus, status_filter, "status")
        query = query.where(Appointment.status == st)
        count_q = count_q.where(Appointment.status == st)
    total = (await db.execute(count_q)).scalar_one()
    rows = (
        await db.execute(
            query.order_by(Appointment.requested_date.desc())
            .offset((page - 1) * per_page)
            .limit(per_page)
        )
    ).scalars().all()
    return {
        "items": [_serialize(a) for a in rows],
        "total": total,
        "page": page,
        "per_page": per_page,
    }


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_appointment(
    payload: AppointmentCreate,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    requested = payload.requested_date
    if requested.tzinfo is None:
        requested = requested.replace(tzinfo=timezone.utc)
    if requested <= datetime.now(timezone.utc):
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "Please choose a future date and time")

    agent = (
        await db.execute(select(User).where(User.role == UserRole.AGENT, User.is_active.is_(True)).limit(1))
    ).scalar_one_or_none()
    appt = Appointment(
        customer_id=current_user.id,
        agent_id=agent.id if agent else None,
        requested_date=requested,
        meeting_type=_parse_enum(MeetingType, payload.meeting_type, "meeting type"),
        purpose=payload.purpose,
        notes=payload.notes,
    )
    db.add(appt)
    await db.commit()
    appt = (
        await db.execute(
            select(Appointment).options(selectinload(Appointment.customer)).where(Appointment.id == appt.id)
        )
    ).scalar_one()
    # Let the agent know a customer requested an appointment
    if settings.AGENT_EMAIL:
        c = appt.customer
        background_tasks.add_task(
            EmailService().send_new_appointment_alert,
            settings.AGENT_EMAIL,
            f"{c.first_name} {c.last_name}".strip(),
            c.email,
            c.phone,
            appt.requested_date,
            appt.meeting_type.value,
            appt.purpose,
            appt.notes,
        )
    return _serialize(appt)


@router.patch("/{appointment_id}")
async def update_appointment(
    appointment_id: UUID,
    payload: AppointmentUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    appt = (
        await db.execute(
            select(Appointment).options(selectinload(Appointment.customer)).where(Appointment.id == appointment_id)
        )
    ).scalar_one_or_none()
    if appt is None or (not _is_staff(current_user) and appt.customer_id != current_user.id):
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Appointment not found")

    new_status = _parse_enum(AppointmentStatus, payload.status, "status") if payload.status else None
    if not _is_staff(current_user):
        # Customers may only cancel their own appointment.
        if new_status != AppointmentStatus.CANCELLED or payload.model_dump(exclude={"status"}, exclude_none=True):
            raise HTTPException(status.HTTP_403_FORBIDDEN, "You can only cancel your appointment")
    if new_status:
        appt.status = new_status
    if payload.confirmed_date is not None:
        appt.confirmed_date = payload.confirmed_date
    if payload.agent_notes is not None:
        appt.agent_notes = payload.agent_notes
    if payload.meeting_link is not None:
        appt.meeting_link = payload.meeting_link
    await db.commit()
    await db.refresh(appt)
    return _serialize(appt)
