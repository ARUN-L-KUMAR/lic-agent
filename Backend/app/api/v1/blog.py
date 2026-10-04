from math import ceil

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db
from app.models.blog import BlogPost, PostStatus

router = APIRouter()


def _summary(p: BlogPost) -> dict:
    return {
        "id": str(p.id), "title": p.title, "slug": p.slug, "excerpt": p.excerpt,
        "cover_image": p.cover_image, "tags": p.tags or [],
        "published_at": p.published_at.isoformat() if p.published_at else None,
    }


@router.get("")
async def list_blog_posts(
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
):
    published = BlogPost.status == PostStatus.PUBLISHED
    total = (await db.execute(select(func.count()).select_from(BlogPost).where(published))).scalar_one()
    rows = (
        await db.execute(
            select(BlogPost).where(published)
            .order_by(BlogPost.published_at.desc()).offset((page - 1) * per_page).limit(per_page)
        )
    ).scalars().all()
    return {"items": [_summary(p) for p in rows], "total": total, "page": page,
            "per_page": per_page, "pages": ceil(total / per_page) if total else 0}


@router.get("/{slug}")
async def get_blog_post(slug: str, db: AsyncSession = Depends(get_db)):
    post = (
        await db.execute(select(BlogPost).where(BlogPost.slug == slug, BlogPost.status == PostStatus.PUBLISHED))
    ).scalar_one_or_none()
    if post is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
    return {**_summary(post), "content": post.content, "seo_title": post.seo_title,
            "seo_description": post.seo_description}
