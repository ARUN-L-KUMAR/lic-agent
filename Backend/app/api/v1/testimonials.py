from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_db
router = APIRouter()
@router.get("")
async def list_testimonials(limit: int = Query(10), db: AsyncSession = Depends(get_db)):
    return {"items": [], "total": 0}
