"""
Calculator Service — illustrative financial calculations.

IMPORTANT: All results are ESTIMATES for illustrative purposes only.
These are NOT official LIC premium calculations.
Actual premiums and benefits depend on:
- Specific policy terms and conditions
- Underwriting decisions
- Applicable bonuses and rates
- Official LIC documentation

The calculation engine is modular so verified formulas can be substituted.
"""
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.calculator import (
    PremiumCalcRequest, PremiumCalcResponse,
    MaturityCalcRequest, MaturityCalcResponse,
    RetirementCalcRequest, RetirementCalcResponse,
    ChildEducationCalcRequest, ChildEducationCalcResponse,
)


class CalculatorService:
    """
    Modular calculation service.
    Each method can be overridden with verified LIC formulas.
    """

    def __init__(self, db: Optional[AsyncSession]):
        self.db = db

    async def estimate_premium(self, req: PremiumCalcRequest) -> PremiumCalcResponse:
        """
        Illustrative premium estimate.
        
        Formula basis: simplified rate tables (NOT official LIC rates).
        Base rate approximately ₹1/1000 sum assured per year, adjusted for:
        - Age factor (higher age = higher rate)
        - Term factor (longer term may = lower per-year rate)
        - Frequency loading
        
        ⚠️ This is illustrative only.
        """
        # Base rate per 1000 SA per year (simplified, not official)
        base_rate = self._get_base_rate(req.age, req.policy_term)
        
        # Annual premium (illustrative)
        annual_premium = (req.sum_assured / 1000) * base_rate
        
        # Frequency loading
        frequency_factors = {
            "Annual": 1.0,
            "Semi-Annual": 1.02,
            "Quarterly": 1.03,
            "Monthly": 1.05,
            "Single": 1.0,
        }
        factor = frequency_factors.get(req.premium_frequency, 1.0)
        annual_premium_with_loading = annual_premium * factor
        
        # Per-frequency amount
        periods_per_year = {
            "Annual": 1,
            "Semi-Annual": 2,
            "Quarterly": 4,
            "Monthly": 12,
            "Single": 1,
        }
        periods = periods_per_year.get(req.premium_frequency, 1)
        per_frequency = annual_premium_with_loading / periods

        return PremiumCalcResponse(
            estimated_annual_premium=round(annual_premium_with_loading, 2),
            estimated_premium_per_frequency=round(per_frequency, 2),
            premium_frequency=req.premium_frequency,
            sum_assured=req.sum_assured,
            policy_term=req.policy_term,
        )

    async def estimate_maturity(self, req: MaturityCalcRequest) -> MaturityCalcResponse:
        """
        Illustrative maturity benefit estimate.
        Assumes: Sum Assured + reversionary bonuses (simplified estimate).
        ⚠️ Actual bonuses declared by LIC annually — cannot be guaranteed.
        """
        # Illustrative base premium
        base_rate = self._get_base_rate(req.age, req.policy_term)
        annual_premium = (req.sum_assured / 1000) * base_rate
        total_premium = annual_premium * req.policy_term

        # Simplified bonus estimate (NOT official): 4% of SA per year
        bonus_rate = 40  # ₹40 per ₹1000 SA per year (illustrative)
        total_bonus = (req.sum_assured / 1000) * bonus_rate * req.policy_term
        
        maturity_benefit = req.sum_assured + total_bonus

        return MaturityCalcResponse(
            estimated_maturity_benefit=round(maturity_benefit, 2),
            estimated_total_premium_paid=round(total_premium, 2),
            policy_term=req.policy_term,
        )

    async def estimate_retirement(self, req: RetirementCalcRequest) -> RetirementCalcResponse:
        """
        Illustrative retirement corpus projection using compound interest.
        """
        years = req.retirement_age - req.current_age
        if years <= 0:
            years = 1
        
        monthly_rate = req.expected_return_rate / 100 / 12
        n = years * 12
        
        # Future value of monthly SIP
        if monthly_rate > 0:
            corpus = req.monthly_investment * ((((1 + monthly_rate) ** n) - 1) / monthly_rate) * (1 + monthly_rate)
        else:
            corpus = req.monthly_investment * n
        
        total_invested = req.monthly_investment * n
        
        # Illustrative monthly pension (4% withdrawal rate / 12)
        monthly_pension = corpus * 0.04 / 12

        return RetirementCalcResponse(
            years_to_retirement=years,
            estimated_corpus=round(corpus, 2),
            total_invested=round(total_invested, 2),
            estimated_monthly_pension=round(monthly_pension, 2),
        )

    async def estimate_child_education(self, req: ChildEducationCalcRequest) -> ChildEducationCalcResponse:
        """
        Illustrative child education fund estimate with inflation adjustment.
        """
        years = req.education_goal_age - req.child_current_age
        if years <= 0:
            years = 1
        
        # Inflation-adjusted cost
        inflation_factor = (1 + req.inflation_rate / 100) ** years
        future_cost = req.estimated_cost_today * inflation_factor
        
        # Monthly savings required (assuming 8% return)
        assumed_return = 0.08
        monthly_rate = assumed_return / 12
        n = years * 12
        
        if monthly_rate > 0 and n > 0:
            monthly_savings = future_cost / ((((1 + monthly_rate) ** n) - 1) / monthly_rate * (1 + monthly_rate))
        else:
            monthly_savings = future_cost / max(n, 1)
        
        # Lump sum required now
        lump_sum = future_cost / ((1 + assumed_return) ** years)

        return ChildEducationCalcResponse(
            years_to_goal=years,
            inflation_adjusted_cost=round(future_cost, 2),
            monthly_savings_required=round(monthly_savings, 2),
            lump_sum_required_now=round(lump_sum, 2),
        )

    def _get_base_rate(self, age: int, term: int) -> float:
        """
        Simplified base rate table (₹ per ₹1000 SA per year).
        NOT official LIC rates. For illustration only.
        """
        # Age-based base rate (simplified)
        if age < 25:
            base = 18
        elif age < 30:
            base = 20
        elif age < 35:
            base = 23
        elif age < 40:
            base = 27
        elif age < 45:
            base = 33
        elif age < 50:
            base = 41
        elif age < 55:
            base = 52
        else:
            base = 68

        # Term adjustment
        if term >= 25:
            base *= 0.85
        elif term >= 20:
            base *= 0.90
        elif term >= 15:
            base *= 0.95
        
        return base
