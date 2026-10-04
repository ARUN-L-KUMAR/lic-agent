"""
Email Service — handles sending transactional emails via SMTP / aiosmtplib.
"""
from datetime import datetime, timedelta, timezone
from email.mime.image import MIMEImage
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from html import escape
from typing import Optional
from urllib.parse import quote
import aiosmtplib
import structlog

from app.core.config import settings
from app.services.email_templates import LOGO_CID, Button, load_logo, render_email

logger = structlog.get_logger(__name__)


class EmailService:
    """Service for sending emails via SMTP."""

    def __init__(self):
        self.smtp_host = settings.SMTP_HOST
        self.smtp_port = settings.SMTP_PORT
        self.smtp_user = settings.SMTP_USER
        self.smtp_password = settings.SMTP_PASSWORD
        self.from_email = settings.SMTP_FROM_EMAIL
        self.from_name = settings.SMTP_FROM_NAME
        self.use_tls = settings.SMTP_USE_TLS
        self.frontend_url = getattr(settings, "FRONTEND_URL", "http://localhost:5000")

    @property
    def is_configured(self) -> bool:
        """Check if SMTP credentials are provided and not dummy placeholders."""
        if not self.smtp_user or not self.smtp_password:
            return False
        if "your_email" in self.smtp_user or "your_email_app_password" in self.smtp_password:
            return False
        return True

    async def send_email(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        text_content: Optional[str] = None,
    ) -> bool:
        """Send an email to a single recipient. The LIC logo is attached inline when the HTML references it."""
        if not self.is_configured:
            logger.info(
                "SMTP not configured or placeholder detected — email delivery skipped in dev mode",
                to=to_email,
                subject=subject,
            )
            return True

        # multipart/related -> (multipart/alternative -> text, html) + inline logo
        message = MIMEMultipart("related")
        message["Subject"] = subject
        message["From"] = f"{self.from_name} <{self.from_email}>"
        message["To"] = to_email
        if settings.AGENT_EMAIL:
            message["Reply-To"] = settings.AGENT_EMAIL

        alternative = MIMEMultipart("alternative")
        if text_content:
            alternative.attach(MIMEText(text_content, "plain", "utf-8"))
        alternative.attach(MIMEText(html_content, "html", "utf-8"))
        message.attach(alternative)

        if f"cid:{LOGO_CID}" in html_content:
            logo = load_logo()
            if logo:
                image = MIMEImage(logo, _subtype="jpeg")
                image.add_header("Content-ID", f"<{LOGO_CID}>")
                image.add_header("Content-Disposition", "inline", filename="lic-logo.jpg")
                message.attach(image)

        try:
            await aiosmtplib.send(
                message,
                hostname=self.smtp_host,
                port=self.smtp_port,
                username=self.smtp_user,
                password=self.smtp_password,
                start_tls=self.use_tls,
                timeout=10,
            )
            logger.info("Email sent successfully", to=to_email, subject=subject)
            return True
        except Exception as exc:
            logger.error("Failed to send email", to=to_email, subject=subject, error=str(exc))
            return False

    async def send_verification_email(self, to_email: str, name: str, token: str) -> bool:
        """Send an account verification email."""
        verification_link = f"{self.frontend_url}/verify-email?token={token}"
        subject = "Please verify your email — LIC Agent"
        text = f"Hi {name},\n\nPlease verify your email by clicking the link:\n{verification_link}\n\nThank you!"
        html = render_email(
            badge="One last step",
            heading=f"Hi {escape(name)}, confirm your email",
            intro="Thank you for creating an account. Please confirm your email address to activate it "
            "and start tracking your enquiries, saved plans and appointments.",
            preheader="Confirm your email to activate your account.",
            buttons=[Button("Verify my email", verification_link)],
            link_fallback=verification_link,
            note="If you did not create this account, you can safely ignore this email.",
        )
        logger.info("Verification link ready", to=to_email, link=verification_link)
        return await self.send_email(to_email, subject, html, text)

    async def send_password_reset_email(self, to_email: str, token: str) -> bool:
        """Send a password reset instructions email."""
        reset_link = f"{self.frontend_url}/reset-password?token={token}"
        subject = "Reset your password — LIC Agent"
        text = f"Hello,\n\nA password reset was requested for your account. Reset password here:\n{reset_link}\n\nIf you did not request this, please ignore."
        html = render_email(
            badge="Security",
            heading="Reset your password",
            intro="We received a request to reset the password for your account. "
            "Use the button below to choose a new one. The link works for a limited time.",
            preheader="Use this link to choose a new password.",
            buttons=[Button("Reset password", reset_link)],
            link_fallback=reset_link,
            note="If you did not request a password reset, you can safely ignore this email. Your password will not change.",
        )
        logger.info("Password reset link ready", to=to_email, link=reset_link)
        return await self.send_email(to_email, subject, html, text)

    async def send_new_registration_alert(
        self,
        agent_email: str,
        first_name: str,
        last_name: str,
        email: str,
        phone: Optional[str],
        registered_at: Optional[datetime] = None,
    ) -> bool:
        """Notify the agent that a new customer has registered."""
        full_name = f"{first_name} {last_name}".strip()
        when = (registered_at or datetime.now()).strftime("%d %b %Y, %I:%M %p")
        subject = f"New customer registered: {full_name}"
        text = chr(10).join([
            "A new customer has registered on your website.",
            "",
            f"Name: {full_name}",
            f"Email: {email}",
            f"Phone: {phone or 'Not provided'}",
            f"Registered: {when}",
        ])

        buttons = []
        if phone:
            buttons.append(Button("Call customer", f"tel:{phone}"))
        buttons.append(Button("Email customer", f"mailto:{email}?subject={quote('Welcome - LIC Agent')}", primary=not phone))
        buttons.append(Button("Open dashboard", f"{self.frontend_url}/admin/customers", primary=False))

        html = render_email(
            badge="New lead",
            heading="A new customer just registered",
            intro=f"<strong>{escape(full_name)}</strong> created an account on your website. "
            "A quick call or message soon after sign-up is the best way to start the conversation.",
            preheader=f"{full_name} registered on your website.",
            rows=[
                ("Name", full_name, None),
                ("Email", email, f"mailto:{email}"),
                ("Phone", phone or "Not provided", f"tel:{phone}" if phone else None),
                ("Registered", when, None),
            ],
            buttons=buttons,
            note="You are receiving this because new registrations are sent to the agent email on this website.",
        )
        return await self.send_email(agent_email, subject, html, text)

    async def send_new_appointment_alert(
        self,
        agent_email: str,
        customer_name: str,
        customer_email: str,
        customer_phone: Optional[str],
        requested_date: datetime,
        meeting_type: str,
        purpose: Optional[str] = None,
        notes: Optional[str] = None,
    ) -> bool:
        """Notify the agent that a customer requested an appointment."""
        ist = timezone(timedelta(hours=5, minutes=30))
        if requested_date.tzinfo is None:
            requested_date = requested_date.replace(tzinfo=timezone.utc)
        when = requested_date.astimezone(ist).strftime("%a, %d %b %Y at %I:%M %p IST")
        subject = f"New appointment request: {customer_name} - {when}"
        text = chr(10).join([
            "A customer has requested an appointment.",
            "",
            f"Customer: {customer_name}",
            f"Email: {customer_email}",
            f"Phone: {customer_phone or 'Not provided'}",
            f"Requested time: {when}",
            f"Meeting type: {meeting_type}",
            f"Purpose: {purpose or '-'}",
            f"Notes: {notes or '-'}",
            "",
            f"Confirm or reschedule: {self.frontend_url}/admin/appointments",
        ])

        rows = [
            ("Customer", customer_name, None),
            ("Requested time", when, None),
            ("Meeting type", meeting_type, None),
            ("Purpose", purpose or "Not specified", None),
        ]
        if notes:
            rows.append(("Notes", notes, None))
        rows += [
            ("Phone", customer_phone or "Not provided", f"tel:{customer_phone}" if customer_phone else None),
            ("Email", customer_email, f"mailto:{customer_email}"),
        ]

        buttons = [Button("Review & confirm", f"{self.frontend_url}/admin/appointments")]
        if customer_phone:
            buttons.append(Button("Call customer", f"tel:{customer_phone}", primary=False))
        buttons.append(Button("Email customer", f"mailto:{customer_email}", primary=False))

        html = render_email(
            badge="Appointment request",
            heading="New appointment request",
            intro=f"<strong>{escape(customer_name)}</strong> would like to meet on <strong>{escape(when)}</strong>. "
            "Please confirm or suggest another time from your dashboard.",
            preheader=f"{customer_name} requested an appointment on {when}.",
            rows=rows,
            buttons=buttons,
            note="The request stays as Requested until you confirm it in the dashboard.",
        )
        return await self.send_email(agent_email, subject, html, text)

    async def send_welcome_email(self, to_email: str, first_name: str) -> bool:
        """Greet a newly registered customer."""
        agent_name = f"{settings.AGENT_FIRST_NAME} {settings.AGENT_LAST_NAME}".strip()
        subject = f"Welcome, {first_name}! Your account is ready"
        text = chr(10).join([
            f"Hi {first_name},",
            "",
            f"Welcome! Thank you for registering on the website of {agent_name}, your LIC agent.",
            "",
            "Here is what you can do with your account:",
            f"- Explore LIC plans: {self.frontend_url}/plans",
            f"- Estimate a premium: {self.frontend_url}/calculators/premium",
            f"- Book an appointment: {self.frontend_url}/book-appointment",
            f"- Ask the advisor: {self.frontend_url}/chat",
            "",
            "Just reply to this email if you have any question.",
            "",
            f"Warm regards,",
            agent_name,
            "LIC Agent",
        ])
        html = render_email(
            badge="Welcome",
            heading=f"Welcome, {escape(first_name)}!",
            intro=f"Thank you for registering. I'm {escape(agent_name)}, your LIC agent, and I'm glad to help you "
            "understand your options and choose a plan that fits your family's goals. "
            "Here is what you can do with your new account:",
            preheader=f"Thanks for registering, {first_name}. Here's how to get started.",
            rows=[
                ("Explore plans", "Compare LIC plans by goal, age and budget", f"{self.frontend_url}/plans"),
                ("Estimate premium", "Try the free premium calculator", f"{self.frontend_url}/calculators/premium"),
                ("Book a meeting", "Request a call, video or in-person chat", f"{self.frontend_url}/book-appointment"),
                ("Ask the advisor", "Get quick answers any time", f"{self.frontend_url}/chat"),
            ],
            buttons=[
                Button("Explore plans", f"{self.frontend_url}/plans"),
                Button("Book an appointment", f"{self.frontend_url}/book-appointment", primary=False),
            ],
            note=f"Questions? Simply reply to this email. Warm regards, <strong>{escape(agent_name)}</strong>, LIC Agent.",
        )
        return await self.send_email(to_email, subject, html, text)
