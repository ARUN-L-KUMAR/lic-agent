"""
AI Schemas — Pydantic v2
"""
from typing import Optional, List
from pydantic import BaseModel


class AISuggestion(BaseModel):
    text: str


class AIChatRequest(BaseModel):
    session_id: str
    message: str
    language: Optional[str] = "en"


class AIChatResponse(BaseModel):
    session_id: str
    message: str
    sources: List[dict] = []
    suggestions: List[AISuggestion] = []
    disclaimer: str = ""


class AIHandoffRequest(BaseModel):
    session_id: str
    customer_goal: Optional[str] = None


class AIHandoffResponse(BaseModel):
    conversation_id: str
    summary: str
    message: str


class AIRecommendationRequest(BaseModel):
    goals: List[str] = []
    age: Optional[int] = None
    income_range: Optional[str] = None
    dependents: Optional[int] = None
    risk_preference: Optional[str] = None


class AIRecommendationResponse(BaseModel):
    categories: List[str]
    reasoning: str
    disclaimer: str = ""
