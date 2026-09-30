"""
Site Settings model - configurable from admin
"""
import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import String, DateTime, Text, func, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class SiteSettings(Base):
    __tablename__ = "site_settings"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Business Info
    business_name: Mapped[str] = mapped_column(String(300), nullable=False, default="LIC Agent Platform")
    agent_name: Mapped[str] = mapped_column(String(200), nullable=False, default="Your LIC Agent")
    agent_code: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    license_number: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    license_info: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    
    # Contact
    phone: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    whatsapp: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    office_address: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    working_hours: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    
    # Content
    about_text: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    tagline: Mapped[Optional[str]] = mapped_column(String(300), nullable=True)
    hero_headline: Mapped[Optional[str]] = mapped_column(String(300), nullable=True)
    hero_subtext: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    # Stats (shown on homepage trust section)
    years_experience: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    customers_served: Mapped[Optional[str]] = mapped_column(String(30), nullable=True)
    plans_supported: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    service_locations: Mapped[Optional[str]] = mapped_column(String(30), nullable=True)
    
    # Media
    logo_url: Mapped[Optional[str]] = mapped_column(String(1024), nullable=True)
    profile_image_url: Mapped[Optional[str]] = mapped_column(String(1024), nullable=True)
    
    # Social links
    social_links: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    
    # SEO
    site_title: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    site_description: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    site_keywords: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    
    # Legal disclaimers
    main_disclaimer: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    insurance_disclaimer: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    ai_disclaimer: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    calculator_disclaimer: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
