"""
API v1 Router - aggregates all sub-routers
"""
from fastapi import APIRouter

from app.api.v1 import (
    auth,
    users,
    customers,
    agents,
    plans,
    calculators,
    enquiries,
    leads,
    appointments,
    chat,
    ai,
    blog,
    testimonials,
    faqs,
    documents,
    notifications,
    analytics,
    admin,
    site_settings,
)

api_router = APIRouter()

# ── Public / Auth ──────────────────────────────────────────
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(site_settings.router, prefix="/site", tags=["Site Settings"])
api_router.include_router(plans.router, prefix="/plans", tags=["Insurance Plans"])
api_router.include_router(calculators.router, prefix="/calculators", tags=["Calculators"])
api_router.include_router(blog.router, prefix="/blog", tags=["Blog"])
api_router.include_router(testimonials.router, prefix="/testimonials", tags=["Testimonials"])
api_router.include_router(faqs.router, prefix="/faqs", tags=["FAQs"])

# ── Customer / Authenticated ───────────────────────────────
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(customers.router, prefix="/customers", tags=["Customers"])
api_router.include_router(leads.router, prefix="/leads", tags=["Leads"])
api_router.include_router(enquiries.router, prefix="/enquiries", tags=["Enquiries"])
api_router.include_router(appointments.router, prefix="/appointments", tags=["Appointments"])
api_router.include_router(chat.router, prefix="/chat", tags=["Chat"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["Notifications"])

# ── AI ─────────────────────────────────────────────────────
api_router.include_router(ai.router, prefix="/ai", tags=["AI Assistant"])

# ── Agent / Admin ──────────────────────────────────────────
api_router.include_router(agents.router, prefix="/agents", tags=["Agents"])
api_router.include_router(documents.router, prefix="/documents", tags=["Documents"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])
api_router.include_router(admin.router, prefix="/admin", tags=["Admin"])
