"""
Update the existing agent records to the real agent information.

Idempotent and non-destructive: updates rows in place (preserving user IDs and
all related leads/chats/appointments) and never deletes anything.

Run: python -m app.scripts.update_agent_info
"""
import asyncio
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent.parent.parent))

from sqlalchemy import select, text

from app.core.database import async_session_factory, engine
from app.models.site_settings import SiteSettings
from app.models.user import AgentProfile, User, UserRole
from app.scripts.seed import (
    AGENT_BIO,
    AGENT_CODE,
    AGENT_EMAIL,
    AGENT_HERO_IMAGE,
    AGENT_IMAGE,
    AGENT_LOCATION,
    AGENT_NAME,
    AGENT_PHONE,
)

FIRST_NAME, LAST_NAME = "LAKSHMI NARAYANAN", "S"
MAIN_DISCLAIMER = (
    "This website is operated by an LIC agent for informational and "
    "customer-service purposes. It is not the official LIC website. "
    "Policy information is subject to official LIC policy documents, "
    "terms, conditions and applicable rules."
)


async def main():
    async with engine.begin() as conn:
        await conn.execute(text("ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS hero_image_url VARCHAR(1024)"))
    async with async_session_factory() as db:
        user = (
            await db.execute(select(User).where(User.role == UserRole.AGENT).order_by(User.created_at))
        ).scalars().first()
        if user is None:
            print("[SKIP] No agent user found; run app.scripts.seed on a fresh database.")
            return

        clash = (
            await db.execute(select(User).where(User.email == AGENT_EMAIL, User.id != user.id))
        ).scalar_one_or_none()
        if clash is not None:
            print(f"[ERROR] {AGENT_EMAIL} already belongs to another user ({clash.id}); aborting.")
            return

        user.email, user.first_name, user.last_name = AGENT_EMAIL, FIRST_NAME, LAST_NAME
        user.phone = AGENT_PHONE

        profile = (
            await db.execute(select(AgentProfile).where(AgentProfile.user_id == user.id))
        ).scalar_one_or_none()
        if profile is None:
            profile = AgentProfile(user_id=user.id)
            db.add(profile)
        profile.agent_code = AGENT_CODE
        profile.license_number = None
        profile.experience_years = None
        profile.bio = AGENT_BIO
        profile.office_address = AGENT_LOCATION
        profile.office_phone = AGENT_PHONE
        profile.profile_image = AGENT_IMAGE

        site = (await db.execute(select(SiteSettings).limit(1))).scalar_one_or_none()
        if site is None:
            site = SiteSettings()
            db.add(site)
        site.business_name = "LAKSHMI NARAYANAN S — LIC Agent"
        site.agent_name = AGENT_NAME
        site.agent_code = AGENT_CODE
        site.license_number = None
        site.phone = AGENT_PHONE
        site.whatsapp = "919787445506"
        site.email = AGENT_EMAIL
        site.office_address = AGENT_LOCATION
        site.profile_image_url = AGENT_IMAGE
        site.hero_image_url = AGENT_HERO_IMAGE
        site.working_hours = None
        site.about_text = AGENT_BIO
        # Unverified figures from the demo data are cleared.
        site.years_experience = None
        site.customers_served = None
        site.plans_supported = None
        site.service_locations = "Ranipet, Vellore"
        site.main_disclaimer = MAIN_DISCLAIMER
        site.site_title = "LAKSHMI NARAYANAN S — LIC Agent, Ranipet, Vellore"
        site.site_description = (
            "Connect with LAKSHMI NARAYANAN S, LIC agent in Ranipet, Vellore, for expert "
            "guidance on life insurance, term plans, pension plans, child education plans, and more."
        )

        await db.commit()
        print(f"[OK] Updated agent user {user.id}, agent profile and site settings.")


if __name__ == "__main__":
    asyncio.run(main())
