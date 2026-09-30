from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_db
router = APIRouter()
@router.get("")
async def list_faqs(limit: int = Query(20), is_published: bool = Query(True), db: AsyncSession = Depends(get_db)):
    return {"items": [], "total": 0}
