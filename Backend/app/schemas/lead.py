"""
Lead Schemas — Pydantic v2
"""
from typing import Optional, List, Any
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, EmailStr


class LeadCreateRequest(BaseModel):
    name: str
    phone: str
    email: Optional[EmailStr] = None
    age: Optional[int] = None
    city: Optional[str] = None
    requirement: Optional[str] = None
    budget: Optional[str] = None
    preferred_contact_time: Optional[str] = None
    message: Optional[str] = None
    interested_plans: Optional[List[str]] = None
    source: str = "WEBSITE"


class LeadUpdateRequest(BaseModel):
    status: Optional[str] = None
    priority: Optional[str] = None
    assigned_agent_id: Optional[UUID] = None
    notes: Optional[List[Any]] = None
    contacted_at: Optional[datetime] = None


class LeadResponse(BaseModel):
    id: UUID
    name: str
    phone: str
    email: Optional[str]
    age: Optional[int]
    city: Optional[str]
    source: str
    status: str
    priority: str
    requirement: Optional[str]
    budget: Optional[str]
    preferred_contact_time: Optional[str]
    message: Optional[str]
    notes: Optional[List[Any]]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class LeadListResponse(BaseModel):
    items: List[LeadResponse]
    total: int
    page: int
    per_page: int
    pages: int
