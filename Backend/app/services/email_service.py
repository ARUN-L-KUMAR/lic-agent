"""
Email Service — handles sending transactional emails via SMTP / aiosmtplib.
"""
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Optional
import aiosmtplib
import structlog

from app.core.config import settings

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
        self.frontend_url = getattr(settings, "FRONTEND_URL", "http://localhost:3000")

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
        """Send an email to a single recipient."""
        if not self.is_configured:
            logger.info(
                "SMTP not configured or placeholder detected — email delivery skipped in dev mode",
                to=to_email,
                subject=subject,
            )
            return True

        message = MIMEMultipart("alternative")
        message["Subject"] = subject
        message["From"] = f"{self.from_name} <{self.from_email}>"
        message["To"] = to_email

        if text_content:
            part1 = MIMEText(text_content, "plain")
            message.attach(part1)

        part2 = MIMEText(html_content, "html")
        message.attach(part2)

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
        subject = "Verify your LIC Agent Platform Account"
        text = f"Hi {name},\n\nPlease verify your email by clicking the link:\n{verification_link}\n\nThank you!"
        html = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
            <h2 style="color: #0b4f6c;">Welcome to LIC Agent Platform!</h2>
            <p>Hi {name},</p>
            <p>Thank you for registering. Please click the button below to verify your email address and activate your account:</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="{verification_link}" style="background-color: #f7941d; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Verify Email</a>
            </div>
            <p style="color: #666; font-size: 13px;">Or copy and paste this link into your browser:<br/><a href="{verification_link}">{verification_link}</a></p>
            <p style="color: #999; font-size: 12px; margin-top: 30px;">If you did not sign up for this account, you can safely ignore this email.</p>
        </div>
        """
        logger.info("Verification link ready", to=to_email, link=verification_link)
        return await self.send_email(to_email, subject, html, text)

    async def send_password_reset_email(self, to_email: str, token: str) -> bool:
        """Send a password reset instructions email."""
        reset_link = f"{self.frontend_url}/reset-password?token={token}"
        subject = "Password Reset Request - LIC Agent Platform"
        text = f"Hello,\n\nA password reset was requested for your account. Reset password here:\n{reset_link}\n\nIf you did not request this, please ignore."
        html = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
            <h2 style="color: #0b4f6c;">Password Reset Request</h2>
            <p>Hello,</p>
            <p>We received a request to reset your password. Click the button below to set a new password:</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="{reset_link}" style="background-color: #0b4f6c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Reset Password</a>
            </div>
            <p style="color: #666; font-size: 13px;">Or copy and paste this link into your browser:<br/><a href="{reset_link}">{reset_link}</a></p>
            <p style="color: #999; font-size: 12px; margin-top: 30px;">If you did not request a password reset, you can safely ignore this email.</p>
        </div>
        """
        logger.info("Password reset link ready", to=to_email, link=reset_link)
        return await self.send_email(to_email, subject, html, text)
