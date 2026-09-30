"""
Plan Schemas — Pydantic v2
"""
from typing import Optional, List, Any
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel


class PlanCategoryResponse(BaseModel):
    id: UUID
    name: str
    slug: str
    description: Optional[str]
    icon: Optional[str]
    display_order: int

    model_config = {"from_attributes": True}


class PlanResponse(BaseModel):
    id: UUID
    plan_code: str
    name: str
    slug: str
    short_description: Optional[str]
    description: Optional[str]
    category: str
    minimum_entry_age: Optional[int]
    maximum_entry_age: Optional[int]
    minimum_term: Optional[int]
    maximum_term: Optional[int]
    premium_frequency: Optional[List[str]]
    minimum_premium: Optional[float]
    maximum_premium: Optional[float]
    minimum_sum_assured: Optional[float]
    maximum_sum_assured: Optional[float]
    maturity_benefits: Optional[str]
    death_benefits: Optional[str]
    survival_benefits: Optional[str]
    tax_benefits: Optional[str]
    features: Optional[List[Any]]
    eligibility: Optional[str]
    documents_required: Optional[List[str]]
    exclusions: Optional[str]
    faq: Optional[List[Any]]
    riders: Optional[List[Any]]
    official_reference: Optional[str]
    last_verified_date: Optional[datetime]
    data_status: str
    cover_image: Optional[str]
    status: str
    is_featured: bool
    display_order: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class PlanSummary(BaseModel):
    """Compact plan response for list views."""
    id: UUID
    plan_code: str
    name: str
    slug: str
    short_description: Optional[str]
    category: str
    minimum_entry_age: Optional[int]
    maximum_entry_age: Optional[int]
    minimum_term: Optional[int]
    maximum_term: Optional[int]
    minimum_premium: Optional[float]
    premium_frequency: Optional[List[str]]
    cover_image: Optional[str]
    is_featured: bool

    model_config = {"from_attributes": True}


class PlanListResponse(BaseModel):
    items: List[PlanSummary]
    total: int
    page: int
    per_page: int
    pages: int


class PlanCompareResponse(BaseModel):
    plans: List[PlanResponse]
    disclaimer: str = (
        "This comparison is for informational purposes only. "
        "Please refer to official LIC policy documents for complete details."
    )


class PlanCreateRequest(BaseModel):
    plan_code: str
    name: str
    slug: str
    short_description: Optional[str] = None
    description: Optional[str] = None
    category: str
    minimum_entry_age: Optional[int] = None
    maximum_entry_age: Optional[int] = None
    minimum_term: Optional[int] = None
    maximum_term: Optional[int] = None
    premium_frequency: Optional[List[str]] = None
    minimum_premium: Optional[float] = None
    maximum_premium: Optional[float] = None
    minimum_sum_assured: Optional[float] = None
    maximum_sum_assured: Optional[float] = None
    maturity_benefits: Optional[str] = None
    death_benefits: Optional[str] = None
    survival_benefits: Optional[str] = None
    tax_benefits: Optional[str] = None
    features: Optional[List[Any]] = None
    eligibility: Optional[str] = None
    documents_required: Optional[List[str]] = None
    exclusions: Optional[str] = None
    faq: Optional[List[Any]] = None
    riders: Optional[List[Any]] = None
    official_reference: Optional[str] = None
    last_verified_date: Optional[datetime] = None
    data_status: str = "unverified"
    status: str = "DRAFT"
    is_featured: bool = False
    display_order: int = 0


class PlanUpdateRequest(PlanCreateRequest):
    plan_code: Optional[str] = None
    name: Optional[str] = None
    slug: Optional[str] = None
    category: Optional[str] = None
