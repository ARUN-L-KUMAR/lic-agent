from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db
from app.models.site_settings import SiteSettings

router = APIRouter()

PUBLIC_FIELDS = (
    "business_name",
    "agent_name",
    "agent_code",
    "tagline",
    "hero_headline",
    "hero_subtext",
    "about_text",
    "years_experience",
    "customers_served",
    "plans_supported",
    "service_locations",
    "phone",
    "whatsapp",
    "email",
    "office_address",
    "profile_image_url",
    "hero_image_url",
    "working_hours",
    "site_title",
    "site_description",
    "main_disclaimer",
    "insurance_disclaimer",
    "ai_disclaimer",
    "calculator_disclaimer",
)

# Used only when the site_settings table has not been seeded yet.
FALLBACK = {
    "business_name": "LAKSHMI NARAYANAN S — LIC Agent",
    "agent_name": "LAKSHMI NARAYANAN S",
    "agent_code": "3572",
    "tagline": "Plan Today. Protect Tomorrow.",
    "service_locations": "Ranipet, Vellore",
    "phone": "+91 9787445506",
    "whatsapp": "919787445506",
    "email": "laxamans1980@gmail.com",
    "office_address": "Ranipet, Vellore, Tamil Nadu, India",
    "profile_image_url": "/profile.png",
    "hero_image_url": "/agent.png",
    "main_disclaimer": (
        "This website is operated by an LIC agent for informational and "
        "customer-service purposes. It is not the official LIC website. "
        "Policy information is subject to official LIC policy documents, "
        "terms, conditions and applicable rules."
    ),
}


@router.get("")
@router.get("/settings")
async def get_site_settings(db: AsyncSession = Depends(get_db)):
    row = (await db.execute(select(SiteSettings).limit(1))).scalar_one_or_none()
    if row is None:
        return FALLBACK
    return {field: getattr(row, field) for field in PUBLIC_FIELDS}
