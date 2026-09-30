from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_db
router = APIRouter()
@router.get("")
async def get_settings(db: AsyncSession = Depends(get_db)):
    return {
        "business_name": "LIC Agent",
        "agent_name": "LAKSHMI NARAYANAN S",
        "tagline": "Plan Today. Protect Tomorrow.",
        "years_experience": "20+",
        "customers_served": "500+",
        "plans_supported": "30+",
        "service_locations": "Ranipet, Vellore & Nearby",
    }
