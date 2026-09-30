"""
Insurance Plans API endpoints
"""
from typing import Optional, List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, get_current_user, require_agent
from app.models.user import User
from app.schemas.plan import (
    PlanResponse, PlanListResponse, PlanCreateRequest,
    PlanUpdateRequest, PlanCompareResponse,
)
from app.services.plan_service import PlanService

router = APIRouter()


@router.get("", response_model=PlanListResponse)
async def list_plans(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    status: Optional[str] = Query("PUBLISHED"),
    min_age: Optional[int] = Query(None),
    max_age: Optional[int] = Query(None),
    purpose: Optional[str] = Query(None),
    is_featured: Optional[bool] = Query(None),
    sort_by: str = Query("display_order"),
    db: AsyncSession = Depends(get_db),
):
    """List insurance plans with filtering, searching, and pagination."""
    service = PlanService(db)
    return await service.list_plans(
        page=page,
        per_page=per_page,
        category=category,
        search=search,
        status_filter=status,
        min_age=min_age,
        max_age=max_age,
        purpose=purpose,
        is_featured=is_featured,
        sort_by=sort_by,
    )


@router.get("/categories", response_model=List[dict])
async def list_categories(db: AsyncSession = Depends(get_db)):
    """List all active plan categories."""
    service = PlanService(db)
    return await service.list_categories()


@router.get("/featured", response_model=List[PlanResponse])
async def featured_plans(
    limit: int = Query(6, ge=1, le=20),
    db: AsyncSession = Depends(get_db),
):
    """Get featured insurance plans for homepage."""
    service = PlanService(db)
    return await service.get_featured_plans(limit=limit)


@router.get("/compare", response_model=PlanCompareResponse)
async def compare_plans(
    plan_ids: str = Query(..., description="Comma-separated plan UUIDs"),
    db: AsyncSession = Depends(get_db),
):
    """Compare multiple insurance plans side by side."""
    ids = [UUID(pid.strip()) for pid in plan_ids.split(",") if pid.strip()]
    if len(ids) < 2 or len(ids) > 4:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Compare requires 2–4 plans",
        )
    service = PlanService(db)
    return await service.compare_plans(ids)


@router.get("/{slug}", response_model=PlanResponse)
async def get_plan(slug: str, db: AsyncSession = Depends(get_db)):
    """Get a single plan by slug."""
    service = PlanService(db)
    plan = await service.get_by_slug(slug)
    if not plan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plan not found")
    return plan


# ── Agent / Admin endpoints ─────────────────────────────────

@router.post("", response_model=PlanResponse, status_code=status.HTTP_201_CREATED)
async def create_plan(
    payload: PlanCreateRequest,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_agent),
):
    """Create a new insurance plan (agent/admin only)."""
    service = PlanService(db)
    return await service.create_plan(payload)


@router.put("/{plan_id}", response_model=PlanResponse)
async def update_plan(
    plan_id: UUID,
    payload: PlanUpdateRequest,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_agent),
):
    """Update a plan (agent/admin only)."""
    service = PlanService(db)
    plan = await service.update_plan(plan_id, payload)
    if not plan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plan not found")
    return plan


@router.patch("/{plan_id}/status", response_model=PlanResponse)
async def update_plan_status(
    plan_id: UUID,
    new_status: str,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_agent),
):
    """Publish, unpublish, or archive a plan (agent/admin only)."""
    service = PlanService(db)
    return await service.update_status(plan_id, new_status)


@router.delete("/{plan_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_plan(
    plan_id: UUID,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_agent),
):
    """Archive a plan (soft delete — agent/admin only)."""
    service = PlanService(db)
    await service.archive_plan(plan_id)
