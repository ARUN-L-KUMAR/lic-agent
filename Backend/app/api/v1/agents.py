from fastapi import APIRouter, Depends
from app.api.deps import require_agent
from app.models.user import User
router = APIRouter()
@router.get("")
async def list_agents(_: User = Depends(require_agent)):
    return []
