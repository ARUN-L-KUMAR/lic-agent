from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_db, require_agent
from app.models.user import User
router = APIRouter()
@router.get("")
async def list_documents(db: AsyncSession = Depends(get_db), _: User = Depends(require_agent)):
    return {"items": [], "total": 0}
