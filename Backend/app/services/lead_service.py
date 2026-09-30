"""
Lead Service — business logic for leads and enquiries.
"""
from datetime import datetime, timezone
import math
from typing import Optional, List, Dict, Any
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import select, func, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.lead import Lead, LeadStatus, LeadPriority, LeadSource
from app.models.user import User
from app.schemas.lead import LeadCreateRequest, LeadUpdateRequest


class LeadService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_lead(self, payload: LeadCreateRequest) -> Lead:
        """Create a new lead / enquiry submission."""
        source_val = LeadSource.WEBSITE
        if payload.source:
            try:
                source_val = LeadSource(payload.source.upper())
            except ValueError:
                source_val = LeadSource.WEBSITE

        lead = Lead(
            name=payload.name.strip(),
            phone=payload.phone.strip(),
            email=str(payload.email).lower() if payload.email else None,
            age=payload.age,
            city=payload.city.strip() if payload.city else None,
            requirement=payload.requirement,
            budget=payload.budget,
            preferred_contact_time=payload.preferred_contact_time,
            message=payload.message,
            interested_plans=payload.interested_plans or [],
            source=source_val,
            status=LeadStatus.NEW,
            priority=LeadPriority.MEDIUM,
            notes=[],
        )

        self.db.add(lead)
        await self.db.commit()
        await self.db.refresh(lead)
        return lead

    async def list_leads(
        self,
        page: int = 1,
        per_page: int = 20,
        status_filter: Optional[str] = None,
        priority: Optional[str] = None,
        search: Optional[str] = None,
    ) -> Dict[str, Any]:
        """List leads with filtering and pagination."""
        query = select(Lead)

        if status_filter:
            try:
                lead_status = LeadStatus(status_filter.upper())
                query = query.where(Lead.status == lead_status)
            except ValueError:
                pass

        if priority:
            try:
                lead_priority = LeadPriority(priority.upper())
                query = query.where(Lead.priority == lead_priority)
            except ValueError:
                pass

        if search:
            term = f"%{search}%"
            query = query.where(
                or_(
                    Lead.name.ilike(term),
                    Lead.phone.ilike(term),
                    Lead.email.ilike(term),
                    Lead.city.ilike(term),
                )
            )

        # Count total
        count_query = select(func.count()).select_from(query.subquery())
        total_result = await self.db.execute(count_query)
        total = total_result.scalar_one()

        # Order & pagination
        query = query.order_by(Lead.created_at.desc())
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

    async def get_by_id(self, lead_id: UUID) -> Optional[Lead]:
        """Get a lead by ID."""
        stmt = select(Lead).where(Lead.id == lead_id)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def update_lead(
        self,
        lead_id: UUID,
        payload: LeadUpdateRequest,
        current_user: User,
    ) -> Lead:
        """Update lead details, status, priority, or notes."""
        lead = await self.get_by_id(lead_id)
        if not lead:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead not found")

        if payload.status:
            try:
                lead.status = LeadStatus(payload.status.upper())
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid status '{payload.status}'",
                )

        if payload.priority:
            try:
                lead.priority = LeadPriority(payload.priority.upper())
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid priority '{payload.priority}'",
                )

        if payload.assigned_agent_id is not None:
            lead.assigned_agent_id = payload.assigned_agent_id

        if payload.contacted_at is not None:
            lead.contacted_at = payload.contacted_at

        if payload.notes is not None:
            # If replacing or appending notes
            lead.notes = payload.notes

        await self.db.commit()
        await self.db.refresh(lead)
        return lead
