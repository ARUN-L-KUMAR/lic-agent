"""
Plan Service — business logic for insurance plans and categories.
"""
import math
from typing import Optional, List, Dict, Any
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import select, func, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.plan import Plan, PlanCategory, PlanStatus, PlanCategoryEnum
from app.schemas.plan import PlanCreateRequest, PlanUpdateRequest


class PlanService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_plans(
        self,
        page: int = 1,
        per_page: int = 20,
        category: Optional[str] = None,
        search: Optional[str] = None,
        status_filter: Optional[str] = "PUBLISHED",
        min_age: Optional[int] = None,
        max_age: Optional[int] = None,
        purpose: Optional[str] = None,
        is_featured: Optional[bool] = None,
        sort_by: str = "display_order",
    ) -> Dict[str, Any]:
        """List insurance plans with flexible filtering, searching, and pagination."""
        query = select(Plan)

        if status_filter:
            try:
                plan_status = PlanStatus(status_filter.upper())
                query = query.where(Plan.status == plan_status)
            except ValueError:
                pass

        if category:
            # Match either enum value or category slug
            query = query.where(
                or_(
                    Plan.category == category,
                    Plan.category.cast(PlanCategoryEnum) == category,
                )
            )

        if search:
            search_term = f"%{search}%"
            query = query.where(
                or_(
                    Plan.name.ilike(search_term),
                    Plan.plan_code.ilike(search_term),
                    Plan.short_description.ilike(search_term),
                )
            )

        if min_age is not None:
            query = query.where(
                or_(
                    Plan.minimum_entry_age.is_(None),
                    Plan.minimum_entry_age <= min_age,
                )
            )

        if max_age is not None:
            query = query.where(
                or_(
                    Plan.maximum_entry_age.is_(None),
                    Plan.maximum_entry_age >= max_age,
                )
            )

        if is_featured is not None:
            query = query.where(Plan.is_featured == is_featured)

        # Count total matches
        count_query = select(func.count()).select_from(query.subquery())
        total_result = await self.db.execute(count_query)
        total = total_result.scalar_one()

        # Sort order
        if sort_by == "display_order":
            query = query.order_by(Plan.display_order.asc(), Plan.created_at.desc())
        elif sort_by == "name":
            query = query.order_by(Plan.name.asc())
        elif sort_by == "created_at":
            query = query.order_by(Plan.created_at.desc())
        else:
            query = query.order_by(Plan.display_order.asc())

        # Pagination
        offset = (page - 1) * per_page
        query = query.offset(offset).limit(per_page)

        result = await self.db.execute(query)
        items = list(result.scalars().all())
        pages = math.ceil(total / per_page) if total > 0 else 0

        return {
            "items": items,
            "total": total,
            "page": page,
            "per_page": per_page,
            "pages": pages,
        }

    async def list_categories(self) -> List[PlanCategory]:
        """List all active plan categories ordered by display order."""
        stmt = select(PlanCategory).where(PlanCategory.is_active == True).order_by(PlanCategory.display_order.asc())
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def get_featured_plans(self, limit: int = 6) -> List[Plan]:
        """Get featured plans for the landing page."""
        stmt = (
            select(Plan)
            .where(Plan.is_featured == True, Plan.status == PlanStatus.PUBLISHED)
            .order_by(Plan.display_order.asc())
            .limit(limit)
        )
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def compare_plans(self, plan_ids: List[UUID]) -> Dict[str, Any]:
        """Fetch plans to compare side-by-side."""
        stmt = select(Plan).where(Plan.id.in_(plan_ids))
        result = await self.db.execute(stmt)
        plans = list(result.scalars().all())
        return {
            "plans": plans,
            "disclaimer": (
                "This comparison is for informational purposes only. "
                "Please refer to official LIC policy documents for complete details."
            ),
        }

    async def get_by_slug(self, slug: str) -> Optional[Plan]:
        """Get a single plan by slug."""
        stmt = select(Plan).where(Plan.slug == slug)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_id(self, plan_id: UUID) -> Optional[Plan]:
        """Get a plan by its primary key UUID."""
        stmt = select(Plan).where(Plan.id == plan_id)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def create_plan(self, payload: PlanCreateRequest) -> Plan:
        """Create a new insurance plan."""
        data = payload.model_dump()
        plan = Plan(**data)
        self.db.add(plan)
        await self.db.commit()
        await self.db.refresh(plan)
        return plan

    async def update_plan(self, plan_id: UUID, payload: PlanUpdateRequest) -> Optional[Plan]:
        """Update an existing insurance plan."""
        plan = await self.get_by_id(plan_id)
        if not plan:
            return None

        data = payload.model_dump(exclude_unset=True)
        for key, value in data.items():
            if hasattr(plan, key) and value is not None:
                setattr(plan, key, value)

        await self.db.commit()
        await self.db.refresh(plan)
        return plan

    async def update_status(self, plan_id: UUID, new_status: str) -> Plan:
        """Update plan publication status."""
        plan = await self.get_by_id(plan_id)
        if not plan:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plan not found")

        try:
            plan.status = PlanStatus(new_status.upper())
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid status '{new_status}'. Allowed: DRAFT, PUBLISHED, ARCHIVED",
            )

        await self.db.commit()
        await self.db.refresh(plan)
        return plan

    async def archive_plan(self, plan_id: UUID) -> None:
        """Soft-delete a plan by setting status to ARCHIVED."""
        await self.update_status(plan_id, PlanStatus.ARCHIVED.value)
