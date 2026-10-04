from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db
from app.models.faq import FAQ

router = APIRouter()


@router.get("")
async def list_faqs(
    limit: int = Query(20, ge=1, le=100),
    is_published: bool = Query(True),
    db: AsyncSession = Depends(get_db),
):
    # Unpublished FAQs are only visible through the admin API.
    rows = (
        await db.execute(
            select(FAQ).where(FAQ.is_published.is_(True)).order_by(FAQ.display_order, FAQ.created_at).limit(limit)
        )
    ).scalars().all()
    items = [{"id": str(f.id), "question": f.question, "answer": f.answer, "category": f.category} for f in rows]
    return {"items": items, "total": len(items)}
