"""
Leads API endpoints
"""
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, get_current_user, require_agent
from app.models.user import User
from app.schemas.lead import LeadCreateRequest, LeadResponse, LeadListResponse, LeadUpdateRequest
from app.services.lead_service import LeadService

router = APIRouter()


@router.post("", response_model=LeadResponse, status_code=status.HTTP_201_CREATED)
async def submit_lead(
    payload: LeadCreateRequest,
    db: AsyncSession = Depends(get_db),
):
    """Submit a new lead / enquiry (public endpoint)."""
    service = LeadService(db)
    return await service.create_lead(payload)


# ── Agent / Admin ──────────────────────────────────────────

@router.get("", response_model=LeadListResponse)
async def list_leads(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    status_filter: Optional[str] = Query(None, alias="status"),
    priority: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_agent),
):
    """List all leads (agent/admin only)."""
    service = LeadService(db)
    return await service.list_leads(page, per_page, status_filter, priority, search)


@router.get("/{lead_id}", response_model=LeadResponse)
async def get_lead(
    lead_id: UUID,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_agent),
):
    """Get a specific lead (agent/admin only)."""
    service = LeadService(db)
    lead = await service.get_by_id(lead_id)
    if not lead:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead not found")
    return lead


@router.patch("/{lead_id}", response_model=LeadResponse)
async def update_lead(
    lead_id: UUID,
    payload: LeadUpdateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_agent),
):
    """Update lead status, notes, assignment (agent/admin only)."""
    service = LeadService(db)
    return await service.update_lead(lead_id, payload, current_user)
