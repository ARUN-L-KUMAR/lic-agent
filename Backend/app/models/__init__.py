"""
SQLAlchemy models package - imports all models for Alembic discovery.
"""
from app.models.user import User, CustomerProfile, AgentProfile
from app.models.plan import Plan, PlanCategory
from app.models.lead import Lead
from app.models.enquiry import Enquiry
from app.models.appointment import Appointment
from app.models.conversation import Conversation, Message
from app.models.blog import BlogPost, BlogCategory
from app.models.testimonial import Testimonial
from app.models.document import Document
from app.models.notification import Notification
from app.models.analytics import AnalyticsEvent
from app.models.site_settings import SiteSettings
from app.models.faq import FAQ
from app.models.ai_knowledge import AIKnowledgeChunk

__all__ = [
    "User", "CustomerProfile", "AgentProfile",
    "Plan", "PlanCategory",
    "Lead",
    "Enquiry",
    "Appointment",
    "Conversation", "Message",
    "BlogPost", "BlogCategory",
    "Testimonial",
    "Document",
    "Notification",
    "AnalyticsEvent",
    "SiteSettings",
    "FAQ",
    "AIKnowledgeChunk",
]
