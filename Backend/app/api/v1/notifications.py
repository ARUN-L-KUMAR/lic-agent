from fastapi import APIRouter, Depends
from app.api.deps import get_current_user
from app.models.user import User
router = APIRouter()
@router.get("")
async def list_notifications(current_user: User = Depends(get_current_user)):
    return {"items": [], "total": 0, "unread": 0}
