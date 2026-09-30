from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_db
router = APIRouter()
@router.get("")
@router.get("/settings")
async def get_site_settings(db: AsyncSession = Depends(get_db)):
    return {
        "business_name": "LIC Agent",
        "agent_name": "LIC Agent",
        "tagline": "Plan Today. Protect Tomorrow.",
        "years_experience": "10+",
        "customers_served": "500+",
        "plans_supported": "30+",
        "service_locations": "Chennai & Nearby",
        "main_disclaimer": "This website is operated by an individual LIC agent. NOT the official LIC website.",
        "ai_disclaimer": "AI-generated information is for general informational purposes. Please consult the LIC agent and official policy documents before making decisions.",
        "calculator_disclaimer": "Illustrative estimate only. Actual policy values depend on specific policy terms and official LIC documentation.",
        "insurance_disclaimer": "Insurance products are subject to policy terms, conditions, exclusions, and applicable rules.",
    }
