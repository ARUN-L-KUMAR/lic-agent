from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, require_agent
from app.models.analytics import AnalyticsEvent
from app.models.appointment import Appointment
from app.models.conversation import Conversation
from app.models.enquiry import Enquiry, EnquiryStatus
from app.models.lead import Lead
from app.models.plan import Plan
from app.models.user import User, UserRole

router = APIRouter()
IST = timezone(timedelta(hours=5, minutes=30))


async def _count(db: AsyncSession, stmt) -> int:
    return (await db.execute(stmt)).scalar_one()


async def _grouped(db: AsyncSession, column) -> list:
    rows = (await db.execute(select(column, func.count()).group_by(column))).all()
    return [{"name": getattr(k, "value", k), "count": c} for k, c in rows]


@router.get("/dashboard")
async def get_dashboard(db: AsyncSession = Depends(get_db), _: User = Depends(require_agent)):
    now = datetime.now(IST)
    today = now.replace(hour=0, minute=0, second=0, microsecond=0)
    week_ago = today - timedelta(days=6)

    leads_rows = (
        await db.execute(select(Lead.created_at).where(Lead.created_at >= week_ago))
    ).scalars().all()
    per_day = {(week_ago + timedelta(days=i)).date().isoformat(): 0 for i in range(7)}
    for created in leads_rows:
        key = created.astimezone(IST).date().isoformat()
        if key in per_day:
            per_day[key] += 1

    return {
        "total_customers": await _count(db, select(func.count()).select_from(User).where(User.role == UserRole.CUSTOMER)),
        "new_leads_today": await _count(db, select(func.count()).select_from(Lead).where(Lead.created_at >= today)),
        "new_leads_week": len(leads_rows),
        "open_enquiries": await _count(
            db,
            select(func.count()).select_from(Enquiry).where(Enquiry.status.in_([EnquiryStatus.OPEN, EnquiryStatus.IN_PROGRESS])),
        ),
        "appointments_today": await _count(
            db,
            select(func.count()).select_from(Appointment).where(
                Appointment.requested_date >= today, Appointment.requested_date < today + timedelta(days=1)
            ),
        ),
        "unread_chats": await _count(db, select(func.coalesce(func.sum(Conversation.agent_unread), 0))),
        "popular_plans": [],
        "leads_by_day": [{"date": d, "count": c} for d, c in per_day.items()],
        "calculator_usage": await _count(
            db, select(func.count()).select_from(AnalyticsEvent).where(AnalyticsEvent.event_type.ilike("%calculator%"))
        ),
        "ai_sessions": await _count(
            db, select(func.count()).select_from(AnalyticsEvent).where(AnalyticsEvent.event_type.ilike("%ai%"))
        ),
        "leads_by_status": await _grouped(db, Lead.status),
        "appointments_by_status": await _grouped(db, Appointment.status),
        "plans_by_status": await _grouped(db, Plan.status),
    }
