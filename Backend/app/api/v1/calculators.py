"""
Calculator API endpoints
All calculations are ILLUSTRATIVE ONLY.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.calculator import (
    PremiumCalcRequest, PremiumCalcResponse,
    MaturityCalcRequest, MaturityCalcResponse,
    RetirementCalcRequest, RetirementCalcResponse,
    ChildEducationCalcRequest, ChildEducationCalcResponse,
)
from app.services.calculator_service import CalculatorService

router = APIRouter()

DISCLAIMER = (
    "Illustrative estimate only. Actual policy values depend on the specific policy terms, "
    "underwriting, applicable bonuses/rates, and official LIC documentation. "
    "Please consult an LIC agent and official policy documents before making decisions."
)


@router.post("/premium", response_model=PremiumCalcResponse)
async def estimate_premium(
    payload: PremiumCalcRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Estimate premium based on age, sum assured, term, and frequency.
    Result is illustrative only.
    """
    service = CalculatorService(db)
    result = await service.estimate_premium(payload)
    result.disclaimer = DISCLAIMER
    return result


@router.post("/maturity", response_model=MaturityCalcResponse)
async def estimate_maturity(
    payload: MaturityCalcRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Estimate maturity benefit. Result is illustrative only.
    """
    service = CalculatorService(db)
    result = await service.estimate_maturity(payload)
    result.disclaimer = DISCLAIMER
    return result


@router.post("/retirement", response_model=RetirementCalcResponse)
async def estimate_retirement(payload: RetirementCalcRequest):
    """
    Illustrative retirement corpus estimation.
    """
    service = CalculatorService(None)
    result = await service.estimate_retirement(payload)
    result.disclaimer = DISCLAIMER
    return result


@router.post("/child-education", response_model=ChildEducationCalcResponse)
async def estimate_child_education(payload: ChildEducationCalcRequest):
    """
    Illustrative child education fund estimation.
    """
    service = CalculatorService(None)
    result = await service.estimate_child_education(payload)
    result.disclaimer = DISCLAIMER
    return result
