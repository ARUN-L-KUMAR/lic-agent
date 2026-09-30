"""
Calculator Schemas — Pydantic v2
All results are illustrative estimates only.
"""
from typing import Optional, List
from pydantic import BaseModel, Field


class PremiumCalcRequest(BaseModel):
    age: int = Field(..., ge=0, le=70, description="Proposer age in years")
    sum_assured: float = Field(..., gt=0, description="Desired sum assured in INR")
    policy_term: int = Field(..., ge=5, le=40, description="Policy term in years")
    premium_frequency: str = Field("Annual", description="Annual/Semi-Annual/Quarterly/Monthly")
    gender: Optional[str] = Field(None, description="Male/Female")
    plan_category: Optional[str] = Field(None, description="Plan category hint")
    riders: Optional[List[str]] = Field(None, description="Optional rider names")


class PremiumCalcResponse(BaseModel):
    estimated_annual_premium: float
    estimated_premium_per_frequency: float
    premium_frequency: str
    sum_assured: float
    policy_term: int
    disclaimer: str = ""
    note: str = "This is an illustrative estimate. Actual premium depends on policy terms and underwriting."


class MaturityCalcRequest(BaseModel):
    age: int = Field(..., ge=0, le=65)
    sum_assured: float = Field(..., gt=0)
    policy_term: int = Field(..., ge=5, le=35)
    premium_frequency: str = "Annual"
    plan_category: Optional[str] = None


class MaturityCalcResponse(BaseModel):
    estimated_maturity_benefit: float
    estimated_total_premium_paid: float
    policy_term: int
    disclaimer: str = ""
    note: str = "Illustrative estimate. Actual maturity benefit depends on bonuses and policy terms."


class RetirementCalcRequest(BaseModel):
    current_age: int = Field(..., ge=18, le=55)
    retirement_age: int = Field(..., ge=40, le=75)
    monthly_investment: float = Field(..., gt=0)
    expected_return_rate: float = Field(6.0, ge=1.0, le=15.0, description="Expected rate % p.a.")


class RetirementCalcResponse(BaseModel):
    years_to_retirement: int
    estimated_corpus: float
    total_invested: float
    estimated_monthly_pension: float
    disclaimer: str = ""
    note: str = "Illustrative projection. Actual returns depend on plan terms and market conditions."


class ChildEducationCalcRequest(BaseModel):
    child_current_age: int = Field(..., ge=0, le=15)
    education_goal_age: int = Field(..., ge=16, le=25)
    estimated_cost_today: float = Field(..., gt=0, description="Education cost at today's prices")
    inflation_rate: float = Field(6.0, ge=0.0, le=15.0)


class ChildEducationCalcResponse(BaseModel):
    years_to_goal: int
    inflation_adjusted_cost: float
    monthly_savings_required: float
    lump_sum_required_now: float
    disclaimer: str = ""
    note: str = "Illustrative estimate. Actual requirements will vary based on specific plan and actual costs."
