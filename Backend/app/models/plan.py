"""
Insurance Plan models
"""
import uuid
from datetime import datetime
from enum import Enum
from typing import Optional, List

from sqlalchemy import (
    String, Boolean, DateTime, Text, Integer, Float,
    ForeignKey, JSON, func, Numeric, Enum as SAEnum
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class PlanCategoryEnum(str, Enum):
    PROTECTION = "Protection"
    SAVINGS = "Savings"
    ENDOWMENT = "Endowment"
    MONEY_BACK = "Money Back"
    WHOLE_LIFE = "Whole Life"
    PENSION = "Pension"
    CHILD_PLANS = "Child Plans"
    ULIP = "ULIP"
    HEALTH = "Health"
    MICRO_INSURANCE = "Micro Insurance"
    RIDERS = "Riders"


class PlanStatus(str, Enum):
    DRAFT = "DRAFT"
    PUBLISHED = "PUBLISHED"
    ARCHIVED = "ARCHIVED"


class PremiumFrequency(str, Enum):
    ANNUAL = "Annual"
    SEMI_ANNUAL = "Semi-Annual"
    QUARTERLY = "Quarterly"
    MONTHLY = "Monthly"
    SINGLE = "Single"


class PlanCategory(Base):
    __tablename__ = "plan_categories"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(100), nullable=False, unique=True)
    slug: Mapped[str] = mapped_column(String(120), nullable=False, unique=True, index=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    icon: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    display_order: Mapped[int] = mapped_column(Integer, default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    plans: Mapped[List["Plan"]] = relationship("Plan", back_populates="category_ref")


class Plan(Base):
    __tablename__ = "plans"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    plan_code: Mapped[str] = mapped_column(String(50), nullable=False, unique=True, index=True)
    name: Mapped[str] = mapped_column(String(300), nullable=False)
    slug: Mapped[str] = mapped_column(String(350), nullable=False, unique=True, index=True)
    short_description: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    category: Mapped[PlanCategoryEnum] = mapped_column(
        SAEnum(PlanCategoryEnum, name="plan_category_enum"), nullable=False
    )
    category_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("plan_categories.id", ondelete="SET NULL"), nullable=True
    )

    # Age eligibility
    minimum_entry_age: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    maximum_entry_age: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    minimum_maturity_age: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    maximum_maturity_age: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    # Policy term
    minimum_term: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    maximum_term: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    # Premium
    premium_frequency: Mapped[Optional[List]] = mapped_column(JSON, nullable=True)
    minimum_premium: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    maximum_premium: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    minimum_sum_assured: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    maximum_sum_assured: Mapped[Optional[float]] = mapped_column(Float, nullable=True)

    # Rich content (JSON for structured, HTML/markdown for text)
    sum_assured_rules: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    maturity_benefits: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    death_benefits: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    survival_benefits: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    riders: Mapped[Optional[List]] = mapped_column(JSON, nullable=True)
    tax_benefits: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    eligibility: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    documents_required: Mapped[Optional[List]] = mapped_column(JSON, nullable=True)
    features: Mapped[Optional[List]] = mapped_column(JSON, nullable=True)
    exclusions: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    faq: Mapped[Optional[List]] = mapped_column(JSON, nullable=True)

    # Metadata and source verification
    official_reference: Mapped[Optional[str]] = mapped_column(String(1024), nullable=True)
    last_verified_date: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    data_status: Mapped[str] = mapped_column(String(50), default="unverified")
    cover_image: Mapped[Optional[str]] = mapped_column(String(1024), nullable=True)

    # Status
    status: Mapped[PlanStatus] = mapped_column(
        SAEnum(PlanStatus, name="plan_status"), default=PlanStatus.DRAFT, nullable=False
    )
    is_featured: Mapped[bool] = mapped_column(Boolean, default=False)
    display_order: Mapped[int] = mapped_column(Integer, default=0)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    # Relationship
    category_ref: Mapped[Optional["PlanCategory"]] = relationship(
        "PlanCategory", back_populates="plans"
    )

    def __repr__(self) -> str:
        return f"<Plan {self.plan_code}: {self.name}>"
