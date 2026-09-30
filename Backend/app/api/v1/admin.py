from fastapi import APIRouter, Depends
from app.api.deps import require_agent
from app.models.user import User
router = APIRouter()
@router.get("/stats")
async def admin_stats(_: User = Depends(require_agent)):
    return {"status": "ok"}
