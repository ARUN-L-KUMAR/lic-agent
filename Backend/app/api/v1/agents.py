from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import get_db, require_agent
from app.models.user import AgentProfile, User, UserRole

router = APIRouter()


@router.get("/profile")
async def public_agent_profile(db: AsyncSession = Depends(get_db)):
    """Public agent profile shown on the About page. Only verified stored values are returned."""
    user = (
        await db.execute(
            select(User)
            .options(selectinload(User.agent_profile))
            .where(User.role == UserRole.AGENT, User.is_active.is_(True))
            .order_by(User.created_at)
            .limit(1)
        )
    ).scalar_one_or_none()
    if user is None:
        return {}
    p: AgentProfile | None = user.agent_profile
    return {
        "name": f"{user.first_name} {user.last_name}",
        "agent_code": p.agent_code if p else None,
        "experience_years": p.experience_years if p else None,
        "bio": p.bio if p else None,
        "specialization": (p.specialization if p else None) or [],
        "office_address": p.office_address if p else None,
        "phone": (p.office_phone if p else None) or user.phone,
        "email": user.email,
        "profile_image": p.profile_image if p else None,
    }


@router.get("")
async def list_agents(_: User = Depends(require_agent)):
    return []
