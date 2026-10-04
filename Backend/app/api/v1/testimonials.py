from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db
from app.models.testimonial import Testimonial

router = APIRouter()


@router.get("")
async def list_testimonials(
    limit: int = Query(10, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
):
    rows = (
        await db.execute(
            select(Testimonial)
            .where(Testimonial.is_published.is_(True))
            .order_by(Testimonial.display_order, Testimonial.created_at.desc())
            .limit(limit)
        )
    ).scalars().all()
    items = [
        {"id": str(t.id), "name": t.name, "location": t.location, "content": t.content,
         "rating": t.rating, "plan_name": t.plan_name}
        for t in rows
    ]
    return {"items": items, "total": len(items)}
