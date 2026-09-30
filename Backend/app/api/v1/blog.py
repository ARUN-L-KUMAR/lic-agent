from fastapi import APIRouter, Depends, Query
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_db
router = APIRouter()
@router.get("")
async def list_blog_posts(page: int = Query(1), per_page: int = Query(10), db: AsyncSession = Depends(get_db)):
    return {"items": [], "total": 0, "page": page, "per_page": per_page, "pages": 0}
@router.get("/{slug}")
async def get_blog_post(slug: str, db: AsyncSession = Depends(get_db)):
    from fastapi import HTTPException, status
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
