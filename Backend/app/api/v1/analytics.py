from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_db, require_agent
from app.models.user import User
router = APIRouter()
@router.get("/dashboard")
async def get_dashboard(db: AsyncSession = Depends(get_db), _: User = Depends(require_agent)):
    return {
        "total_customers": 0,
        "new_leads_today": 0,
        "new_leads_week": 0,
        "open_enquiries": 0,
        "appointments_today": 0,
        "unread_chats": 0,
        "popular_plans": [],
        "leads_by_day": [],
        "calculator_usage": 0,
        "ai_sessions": 0,
    }
