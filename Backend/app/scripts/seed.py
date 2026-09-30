"""
Database Seed Script — populates initial data for development.

Run: python -m app.scripts.seed
"""
import asyncio
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent.parent.parent))

from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import async_session_factory, engine, Base
from app.core.security import hash_password
from app.core.config import settings
from app.models.user import User, UserRole, CustomerProfile, AgentProfile
from app.models.plan import Plan, PlanCategory, PlanStatus, PlanCategoryEnum
from app.models.faq import FAQ
from app.models.site_settings import SiteSettings
from app.models.blog import BlogCategory


async def seed_users(db: AsyncSession):
    """Create admin, agent, and demo customer users."""
    print("Seeding users...")

    # Admin
    admin = User(
        email=settings.ADMIN_EMAIL,
        first_name=settings.ADMIN_FIRST_NAME,
        last_name=settings.ADMIN_LAST_NAME,
        password_hash=hash_password(settings.ADMIN_PASSWORD),
        role=UserRole.ADMIN,
        is_active=True,
        is_verified=True,
    )
    db.add(admin)

    # Agent
    agent = User(
        email=settings.AGENT_EMAIL,
        first_name=settings.AGENT_FIRST_NAME,
        last_name=settings.AGENT_LAST_NAME,
        password_hash=hash_password(settings.AGENT_PASSWORD),
        role=UserRole.AGENT,
        is_active=True,
        is_verified=True,
    )
    db.add(agent)

    # Demo customer
    customer = User(
        email="customer@demo.com",
        first_name="Demo",
        last_name="Customer",
        password_hash=hash_password("Customer@123456"),
        role=UserRole.CUSTOMER,
        is_active=True,
        is_verified=True,
    )
    db.add(customer)
    await db.flush()

    # Agent profile
    agent_profile = AgentProfile(
        user_id=agent.id,
        agent_code="LIC-AGENT-3072",
        license_number="IC-AGENT-12345",
        experience_years=10,
        bio=(
            "I am a certified LIC agent with over 20 years of experience helping families "
            "secure their financial future through the right insurance plans."
        ),
        specialization=["Term Insurance", "Endowment", "Child Plans", "Pension"],
        office_address="Ranipet, Tamil Nadu, India",
        office_phone="+91-9787445506",
    )
    db.add(agent_profile)

    # Customer profile
    customer_profile = CustomerProfile(
        user_id=customer.id,
        occupation="Software Engineer",
        city="Chennai",
        state="Tamil Nadu",
        pincode="600001",
        family_size=3,
        dependents=1,
    )
    db.add(customer_profile)

    await db.flush()
    print(f"  Created: {admin.email}, {agent.email}, {customer.email}")


async def seed_plan_categories(db: AsyncSession):
    """Create plan category records."""
    print("Seeding plan categories...")
    categories = [
        ("Protection", "protection", "Term and pure protection plans"),
        ("Savings", "savings", "Long-term savings plans with insurance coverage"),
        ("Endowment", "endowment", "Plans that provide savings plus insurance"),
        ("Money Back", "money-back", "Plans with periodic survival benefits"),
        ("Whole Life", "whole-life", "Lifelong insurance coverage plans"),
        ("Pension", "pension", "Retirement and annuity plans"),
        ("Child Plans", "child-plans", "Plans designed for children's future"),
        ("ULIP", "ulip", "Unit Linked Insurance Plans — market-linked returns"),
        ("Health", "health", "Health and critical illness coverage"),
        ("Micro Insurance", "micro-insurance", "Affordable micro insurance products"),
    ]
    for i, (name, slug, desc) in enumerate(categories):
        cat = PlanCategory(name=name, slug=slug, description=desc, display_order=i)
        db.add(cat)
    await db.flush()
    print(f"  Created {len(categories)} categories")


async def seed_faqs(db: AsyncSession):
    """Create sample FAQs (general insurance education, not fabricated LIC data)."""
    print("Seeding FAQs...")
    faqs = [
        (
            "What is LIC?",
            "Life Insurance Corporation of India (LIC) is India's largest public sector "
            "life insurance company, established in 1956. It offers a wide range of "
            "life insurance products.",
            "General"
        ),
        (
            "What is the difference between term insurance and endowment plans?",
            "Term insurance provides pure life cover for a specific period — if the "
            "insured survives the term, no maturity benefit is paid. Endowment plans "
            "combine insurance with savings — they pay a maturity benefit if the "
            "insured survives the policy term, in addition to death benefits.",
            "Plans"
        ),
        (
            "What tax benefits are available on LIC premiums?",
            "Premium paid towards eligible LIC policies may qualify for deduction under "
            "Section 80C of the Income Tax Act, subject to applicable limits and conditions. "
            "Please consult a tax professional and refer to official guidelines for current rules.",
            "Tax"
        ),
        (
            "How do I check my LIC policy status?",
            "You can check your LIC policy status through: LIC's official website "
            "(licindia.in), the LIC mobile app, your registered agent, or by visiting "
            "the nearest LIC branch office.",
            "General"
        ),
        (
            "What documents are required to buy an LIC policy?",
            "Commonly required documents include: identity proof (Aadhaar, PAN, Passport), "
            "address proof, date of birth proof, income proof (for certain plans), and "
            "recent photographs. Requirements may vary by plan.",
            "Documents"
        ),
        (
            "Can I take a loan against my LIC policy?",
            "LIC offers policy loans against certain eligible policies (such as endowment "
            "and whole life plans) after they acquire surrender value. Loan terms and "
            "eligibility are subject to specific policy conditions.",
            "General"
        ),
        (
            "What is the grace period for paying LIC premiums?",
            "LIC typically offers a grace period for premium payments. For monthly premium "
            "frequency policies, it is generally 15 days; for other frequencies, it is "
            "typically 30 days. Exact terms are subject to the specific policy.",
            "Premiums"
        ),
        (
            "What is this website? Is this the official LIC website?",
            "This website is operated by an individual LIC agent for informational and "
            "customer-service purposes. It is NOT the official LIC website. "
            "The official LIC website is www.licindia.in. Policy information here is "
            "for general understanding and subject to official LIC documents.",
            "About"
        ),
    ]
    for i, (q, a, cat) in enumerate(faqs):
        faq = FAQ(question=q, answer=a, category=cat, display_order=i, include_in_ai=True)
        db.add(faq)
    await db.flush()
    print(f"  Created {len(faqs)} FAQs")


async def seed_site_settings(db: AsyncSession):
    """Create default site settings."""
    print("Seeding site settings...")
    settings_obj = SiteSettings(
        business_name="LIC Agent — Your Trusted Insurance Partner",
        agent_name="LIC Agent",
        agent_code="LIC-AGENT-001",
        tagline="Plan Today. Protect Tomorrow.",
        hero_headline="Secure Your Family's Future",
        hero_subtext=(
            "Expert guidance on Life Insurance Corporation of India (LIC) plans. "
            "From term insurance to pension plans, we help you make informed decisions "
            "for financial protection, child education, and retirement planning."
        ),
        about_text=(
            "As a licensed LIC agent with over 10 years of experience, I am committed "
            "to helping families and individuals across Tamil Nadu find the right "
            "insurance solutions for their needs. My goal is to simplify the process "
            "of choosing insurance so you can focus on what matters most."
        ),
        years_experience="10+",
        customers_served="500+",
        plans_supported="30+",
        service_locations="Chennai & Nearby",
        working_hours="Mon–Sat: 9:00 AM – 6:00 PM IST",
        main_disclaimer=(
            "This website is operated by an individual LIC agent for informational and "
            "customer-service purposes. It is NOT the official LIC website. "
            "Policy information is subject to official LIC policy documents, "
            "terms, conditions, and applicable rules."
        ),
        insurance_disclaimer=(
            "Insurance products and benefits are subject to the terms, conditions, "
            "exclusions, and rules applicable to the policy. Please refer to the "
            "official LIC policy documents for complete details."
        ),
        ai_disclaimer=(
            "AI-generated information is for general informational purposes only. "
            "Please consult the LIC agent and official policy documents before making decisions."
        ),
        calculator_disclaimer=(
            "Illustrative estimate only. Actual policy values depend on the specific "
            "policy terms, underwriting, applicable bonuses/rates, and official LIC documentation."
        ),
        site_title="LIC Insurance Agent — Trusted Plans & Expert Advice",
        site_description=(
            "Connect with a trusted LIC agent for expert guidance on life insurance, "
            "term plans, pension plans, child education plans, and more."
        ),
    )
    db.add(settings_obj)
    await db.flush()
    print("  Site settings created")


async def seed_blog_categories(db: AsyncSession):
    """Create blog categories."""
    print("Seeding blog categories...")
    cats = [
        ("Insurance Basics", "insurance-basics"),
        ("Tax Planning", "tax-planning"),
        ("Retirement Planning", "retirement-planning"),
        ("Child Planning", "child-planning"),
        ("Policy Updates", "policy-updates"),
    ]
    for name, slug in cats:
        cat = BlogCategory(name=name, slug=slug)
        db.add(cat)
    await db.flush()
    print(f"  Created {len(cats)} blog categories")


async def seed_plans(db: AsyncSession):
    """Seed popular LIC plans."""
    print("Seeding plans...")
    plans_data = [
        Plan(
            plan_code="936",
            name="LIC Jeevan Labh",
            slug="lic-jeevan-labh-936",
            short_description="A limited premium paying, non-linked, with-profits endowment plan offering high financial protection and savings.",
            description="LIC Jeevan Labh (Plan 936) is one of LIC's most popular limited premium endowment plans. You pay premiums for a limited term (10, 15, or 16 years) and enjoy insurance cover for 16, 21, or 25 years respectively.",
            category=PlanCategoryEnum.ENDOWMENT,
            minimum_entry_age=8,
            maximum_entry_age=59,
            minimum_term=16,
            maximum_term=25,
            minimum_sum_assured=200000,
            minimum_premium=15000,
            premium_frequency=["Annual", "Semi-Annual", "Quarterly", "Monthly"],
            maturity_benefits="Sum Assured on Maturity along with vested Simple Reversionary Bonuses and Final Additional Bonus, if any.",
            death_benefits="Sum Assured on Death (higher of 7 times annualized premium or Basic Sum Assured) + vested bonuses.",
            tax_benefits="Tax deduction under Section 80C on premiums paid, and maturity proceeds exempt under Section 10(10D) as per IT rules.",
            features=[
                "Limited premium payment terms (10, 15, 16 years)",
                "High bonus earning potential",
                "Loan facility available after 2 years",
                "Optional riders: Accidental Death, Disability, Term Rider, Critical Illness"
            ],
            status=PlanStatus.PUBLISHED,
            is_featured=True,
            display_order=1,
            data_status="verified",
        ),
        Plan(
            plan_code="915",
            name="LIC New Jeevan Anand",
            slug="lic-new-jeevan-anand-915",
            short_description="Combines savings with lifetime financial protection, continuing coverage even after policy maturity.",
            description="LIC's New Jeevan Anand is an iconic combination of endowment and whole life insurance. It provides financial protection against death throughout the lifetime of the policyholder with the provision of payment of a lump sum at the end of the selected policy term in case of survival.",
            category=PlanCategoryEnum.ENDOWMENT,
            minimum_entry_age=18,
            maximum_entry_age=50,
            minimum_term=15,
            maximum_term=35,
            minimum_sum_assured=100000,
            minimum_premium=10000,
            premium_frequency=["Annual", "Semi-Annual", "Quarterly", "Monthly"],
            maturity_benefits="Basic Sum Assured + vested bonuses paid on maturity, and the life cover continues for life.",
            death_benefits="During term: Sum Assured on Death + bonuses. After term: Basic Sum Assured paid on death anytime.",
            tax_benefits="Section 80C deduction and Section 10(10D) tax-free maturity subject to applicable conditions.",
            features=[
                "Lifetime risk cover even after maturity",
                "Double benefit of savings and life cover",
                "Loan and surrender facilities after 2 years"
            ],
            status=PlanStatus.PUBLISHED,
            is_featured=True,
            display_order=2,
            data_status="verified",
        ),
        Plan(
            plan_code="945",
            name="LIC Jeevan Umang",
            slug="lic-jeevan-umang-945",
            short_description="Lifelong 8% annual survival benefit after premium payment term till age 100 plus life cover.",
            description="LIC Jeevan Umang offers guaranteed annual payouts of 8% of Basic Sum Assured each year after the premium paying period until maturity at age 100 or death.",
            category=PlanCategoryEnum.WHOLE_LIFE,
            minimum_entry_age=0,
            maximum_entry_age=55,
            minimum_term=15,
            maximum_term=30,
            minimum_sum_assured=200000,
            minimum_premium=25000,
            premium_frequency=["Annual", "Semi-Annual", "Quarterly", "Monthly"],
            maturity_benefits="Sum Assured + Final Additional Bonus on reaching age 100.",
            survival_benefits="8% of Basic Sum Assured paid annually from the end of PPT till age 99.",
            death_benefits="Sum Assured on Death + vested Simple Reversionary Bonuses + Final Additional Bonus.",
            tax_benefits="Tax rebates under Sec 80C and tax-free payouts under Sec 10(10D).",
            features=[
                "Guaranteed 8% annual survival income",
                "Whole life protection up to age 100",
                "Ideal for retirement pension planning"
            ],
            status=PlanStatus.PUBLISHED,
            is_featured=True,
            display_order=3,
            data_status="verified",
        ),
        Plan(
            plan_code="854",
            name="LIC Tech Term",
            slug="lic-tech-term-854",
            short_description="Pure risk protection plan offering high life cover at very affordable premium rates.",
            description="LIC Tech Term is a pure protection term insurance plan that provides financial protection to the insured family in case of unfortunate demise.",
            category=PlanCategoryEnum.PROTECTION,
            minimum_entry_age=18,
            maximum_entry_age=65,
            minimum_term=10,
            maximum_term=40,
            minimum_sum_assured=5000000,
            minimum_premium=8000,
            premium_frequency=["Annual", "Semi-Annual", "Single"],
            maturity_benefits="None (pure term insurance).",
            death_benefits="Level Sum Assured or Increasing Sum Assured as chosen at inception.",
            tax_benefits="Section 80C tax deduction on premiums paid.",
            features=[
                "High sum assured discounts",
                "Special rates for women and non-smokers",
                "Option for increasing sum assured"
            ],
            status=PlanStatus.PUBLISHED,
            is_featured=True,
            display_order=4,
            data_status="verified",
        ),
        Plan(
            plan_code="871",
            name="LIC Jeevan Utsav",
            slug="lic-jeevan-utsav-871",
            short_description="Guaranteed 10% annual income benefit for life with guaranteed additions during PPT.",
            description="LIC Jeevan Utsav is a non-linked, non-participating, individual, savings, whole life insurance plan with guaranteed additions of Rs. 40 per thousand throughout premium paying term.",
            category=PlanCategoryEnum.SAVINGS,
            minimum_entry_age=0,
            maximum_entry_age=65,
            minimum_term=5,
            maximum_term=16,
            minimum_sum_assured=500000,
            minimum_premium=30000,
            premium_frequency=["Annual", "Semi-Annual", "Quarterly", "Monthly"],
            survival_benefits="Regular income benefit of 10% of Sum Assured or Flexi income benefit accumulating at 5.5% p.a.",
            death_benefits="Sum Assured on Death plus accrued Guaranteed Additions.",
            tax_benefits="Tax deduction under 80C and tax-exempt income under 10(10D).",
            features=[
                "Guaranteed 10% annual income for life",
                "Guaranteed additions of Rs 40/1000 sum assured",
                "Limited premium paying options (5 to 16 years)"
            ],
            status=PlanStatus.PUBLISHED,
            is_featured=True,
            display_order=5,
            data_status="verified",
        ),
        Plan(
            plan_code="862",
            name="LIC Saral Pension",
            slug="lic-saral-pension-862",
            short_description="Immediate annuity plan offering guaranteed lifetime pension with 100% return of purchase price.",
            description="LIC Saral Pension is a standard immediate annuity plan providing regular pension income for life starting immediately upon payment of a lump sum purchase price.",
            category=PlanCategoryEnum.PENSION,
            minimum_entry_age=40,
            maximum_entry_age=80,
            minimum_term=1,
            maximum_term=1,
            minimum_sum_assured=100000,
            minimum_premium=100000,
            premium_frequency=["Single"],
            survival_benefits="Guaranteed annuity paid monthly, quarterly, half-yearly, or yearly for life.",
            death_benefits="100% Return of Purchase Price to nominee upon demise.",
            tax_benefits="Annuity payments are taxable as per prevailing income tax slabs.",
            features=[
                "Guaranteed lifetime annuity rates",
                "100% return of purchase price to nominee",
                "Joint life annuity option for spouse"
            ],
            status=PlanStatus.PUBLISHED,
            is_featured=True,
            display_order=6,
            data_status="verified",
        ),
    ]
    for p in plans_data:
        db.add(p)
    await db.flush()
    print(f"  Created {len(plans_data)} plans")


async def main():
    print("Starting database seed...")
    async with async_session_factory() as db:
        try:
            await seed_users(db)
            await seed_plan_categories(db)
            await seed_plans(db)
            await seed_faqs(db)
            await seed_site_settings(db)
            await seed_blog_categories(db)
            await db.commit()
            print("\n[SUCCESS] Database seeded successfully!")
            print("\nDefault credentials:")
            print(f"  Admin:    {settings.ADMIN_EMAIL} / {settings.ADMIN_PASSWORD}")
            print(f"  Agent:    {settings.AGENT_EMAIL} / {settings.AGENT_PASSWORD}")
            print(f"  Customer: customer@demo.com / Customer@123456")
            print("\n[NOTE] Change all passwords before production deployment!")
        except Exception as e:
            await db.rollback()
            print(f"\n[ERROR] Seed failed: {e}")
            raise


if __name__ == "__main__":
    asyncio.run(main())

