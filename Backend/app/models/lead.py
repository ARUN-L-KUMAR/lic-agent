"""
Lead / Enquiry model
"""
import uuid
from datetime import datetime
from enum import Enum
from typing import Optional, List

from sqlalchemy import String, DateTime, Text, Integer, ForeignKey, JSON, func, Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class LeadStatus(str, Enum):
    NEW = "NEW"
    CONTACTED = "CONTACTED"
    QUALIFIED = "QUALIFIED"
    APPOINTMENT = "APPOINTMENT"
    CONVERTED = "CONVERTED"
    CLOSED = "CLOSED"


class LeadPriority(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    URGENT = "URGENT"


class LeadSource(str, Enum):
    WEBSITE = "WEBSITE"
    REFERRAL = "REFERRAL"
    SOCIAL = "SOCIAL"
    CHAT = "CHAT"
    PHONE = "PHONE"
    WALK_IN = "WALK_IN"
    OTHER = "OTHER"


class Lead(Base):
    __tablename__ = "leads"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Customer info (may or may not have an account)
    customer_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )
    
    # Contact info (for non-registered leads)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    phone: Mapped[str] = mapped_column(String(20), nullable=False)
    age: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    city: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    
    # Lead details
    source: Mapped[LeadSource] = mapped_column(
        SAEnum(LeadSource, name="lead_source"), default=LeadSource.WEBSITE, nullable=False
    )
    status: Mapped[LeadStatus] = mapped_column(
        SAEnum(LeadStatus, name="lead_status"), default=LeadStatus.NEW, nullable=False, index=True
    )
    priority: Mapped[LeadPriority] = mapped_column(
        SAEnum(LeadPriority, name="lead_priority"), default=LeadPriority.MEDIUM, nullable=False
    )
    requirement: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    budget: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    preferred_contact_time: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    interested_plans: Mapped[Optional[List]] = mapped_column(JSON, nullable=True)
    
    # Assignment
    assigned_agent_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    notes: Mapped[Optional[List]] = mapped_column(JSON, nullable=True, default=list)
    
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False, index=True
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )
    contacted_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    customer: Mapped[Optional["User"]] = relationship(
        "User", foreign_keys=[customer_id], primaryjoin="Lead.customer_id == User.id"
    )
    assigned_agent: Mapped[Optional["User"]] = relationship(
        "User", foreign_keys=[assigned_agent_id], primaryjoin="Lead.assigned_agent_id == User.id"
    )

    def __repr__(self) -> str:
        return f"<Lead {self.name} ({self.status})>"
