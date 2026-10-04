"""
Send a real test email using the SMTP settings in Backend/.env and print the exact result.

Usage (from Backend/):
    python -m app.scripts.test_email you@example.com
"""
import asyncio
import sys
from email.mime.text import MIMEText

import aiosmtplib

from app.core.config import settings


async def main(to_email: str) -> int:
    print(f"Host: {settings.SMTP_HOST}:{settings.SMTP_PORT}  STARTTLS: {settings.SMTP_USE_TLS}")
    print(f"User: {settings.SMTP_USER}")
    print(f"Password set: {bool(settings.SMTP_PASSWORD)}")

    if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        print("FAIL: SMTP_USER or SMTP_PASSWORD is empty - the app would silently skip sending.")
        return 1

    message = MIMEText("SMTP test from LIC Agent Platform. If you can read this, email works.")
    message["Subject"] = "LIC Agent SMTP test"
    message["From"] = f"{settings.SMTP_FROM_NAME.strip()} <{settings.SMTP_FROM_EMAIL.strip()}>"
    message["To"] = to_email

    try:
        await aiosmtplib.send(
            message,
            hostname=settings.SMTP_HOST,
            port=settings.SMTP_PORT,
            username=settings.SMTP_USER,
            password=settings.SMTP_PASSWORD,
            start_tls=settings.SMTP_USE_TLS,
            timeout=15,
        )
    except aiosmtplib.SMTPAuthenticationError as exc:
        print(f"FAIL (login rejected): {exc}\nUse a 16-character Gmail App Password (2-Step Verification required).")
        return 1
    except Exception as exc:
        print(f"FAIL: {type(exc).__name__}: {exc}")
        return 1

    print(f"OK: accepted by the SMTP server. Check the inbox (and spam) of {to_email}.")
    return 0


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit("Usage: python -m app.scripts.test_email <recipient@example.com>")
    sys.exit(asyncio.run(main(sys.argv[1])))
