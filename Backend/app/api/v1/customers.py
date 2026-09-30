"""Auto-generated stub endpoints."""
from fastapi import APIRouter, Depends
from app.api.deps import get_current_user, require_agent
from app.models.user import User

router = APIRouter()

@router.get("/profile")
async def get_customer_profile(current_user: User = Depends(get_current_user)):
    return {"user_id": str(current_user.id)}
