"""
Auth Service — business logic for authentication
"""
from datetime import timedelta
from uuid import UUID
from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import hash_password, verify_password, generate_verification_token
from app.models.user import User, UserRole, CustomerProfile
from app.repositories.user_repository import UserRepository
from app.schemas.auth import RegisterRequest


class AuthService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = UserRepository(db)

    async def register_customer(self, payload: RegisterRequest) -> User:
        """Register a new customer. Raises if email is already taken."""
        existing = await self.repo.get_by_email(payload.email)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="An account with this email already exists",
            )

        verification_token = generate_verification_token()
        user = User(
            email=payload.email.lower(),
            first_name=payload.first_name.strip(),
            last_name=payload.last_name.strip(),
            phone=payload.phone,
            password_hash=hash_password(payload.password),
            role=UserRole.CUSTOMER,
            is_active=True,
            is_verified=False,
            email_verification_token=verification_token,
        )
        self.db.add(user)
        await self.db.flush()

        profile = CustomerProfile(user_id=user.id)
        self.db.add(profile)

        return user

    async def authenticate(self, email: str, password: str) -> User:
        """Validate credentials and return the user."""
        user = await self.repo.get_by_email(email.lower())
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )
        if not verify_password(password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account has been disabled",
            )
        
        # Rehash if needed (Argon2 parameter update)
        from app.core.security import needs_rehash
        if needs_rehash(user.password_hash):
            user.password_hash = hash_password(password)

        # Update last login
        from datetime import datetime, timezone
        user.last_login = datetime.now(timezone.utc)
        
        return user

    async def verify_email(self, token: str) -> None:
        """Mark user email as verified."""
        user = await self.repo.get_by_verification_token(token)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired verification token",
            )
        user.is_verified = True
        user.email_verification_token = None

    async def initiate_password_reset(self, email: str) -> Optional[str]:
        """Create password reset token. Returns token if user exists, None otherwise."""
        user = await self.repo.get_by_email(email.lower())
        if not user:
            return None
        token = generate_verification_token()
        user.password_reset_token = token
        return token

    async def reset_password(self, token: str, new_password: str) -> None:
        """Reset password using a valid token."""
        user = await self.repo.get_by_reset_token(token)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired reset token",
            )
        user.password_hash = hash_password(new_password)
        user.password_reset_token = None

    async def get_user_by_id(self, user_id: str) -> Optional[User]:
        """Get user by ID string."""
        return await self.repo.get_by_id(UUID(user_id))
