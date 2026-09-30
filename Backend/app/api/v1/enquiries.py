from fastapi import APIRouter, Depends, Query
from typing import Optional
from app.api.deps import get_db, get_current_user
from app.models.user import User
from sqlalchemy.ext.asyncio import AsyncSession
router = APIRouter()
@router.get("")
async def list_enquiries(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return {"items": [], "total": 0, "page": 1, "per_page": 20, "pages": 0}
@router.post("")
async def create_enquiry(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return {}
