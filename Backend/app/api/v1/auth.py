"""
Authentication API endpoints
"""
from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, Response, status, BackgroundTasks
from jose import JWTError
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.config import settings
from app.core.database import get_db
from app.core.security import (
    create_access_token, create_refresh_token,
    decode_refresh_token, generate_verification_token,
)
from app.models.user import User
from app.schemas.auth import (
    LoginRequest, RegisterRequest, TokenResponse,
    RefreshRequest, ForgotPasswordRequest, ResetPasswordRequest,
    MessageResponse,
)
from app.services.auth_service import AuthService
from app.services.email_service import EmailService

router = APIRouter()


def set_auth_cookies(response: Response, access_token: str, refresh_token: str) -> None:
    """Set HTTP-only auth cookies."""
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=settings.is_production,
        samesite="lax",
        max_age=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=settings.is_production,
        samesite="lax",
        max_age=settings.JWT_REFRESH_TOKEN_EXPIRE_DAYS * 86400,
    )


@router.post("/register", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
async def register(
    payload: RegisterRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    """Register a new customer account."""
    service = AuthService(db)
    user = await service.register_customer(payload)

    # Send verification email in background
    email_service = EmailService()
    background_tasks.add_task(
        email_service.send_verification_email,
        user.email,
        user.first_name,
        user.email_verification_token,
    )
    # Greet the new customer
    background_tasks.add_task(
        email_service.send_welcome_email,
        user.email,
        user.first_name,
    )
    # Let the agent know a new customer signed up
    if settings.AGENT_EMAIL:
        background_tasks.add_task(
            email_service.send_new_registration_alert,
            settings.AGENT_EMAIL,
            user.first_name,
            user.last_name,
            user.email,
            user.phone,
        )
    return {"message": "Registration successful. Please verify your email."}


@router.post("/login", response_model=TokenResponse)
async def login(
    payload: LoginRequest,
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    """Login and receive JWT tokens via HTTP-only cookies."""
    service = AuthService(db)
    user = await service.authenticate(payload.email, payload.password)

    access_token = create_access_token(str(user.id), user.role.value)
    refresh_token = create_refresh_token(str(user.id), user.role.value)

    set_auth_cookies(response, access_token, refresh_token)

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        role=user.role.value,
        user_id=str(user.id),
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(
    response: Response,
    payload: RefreshRequest,
    db: AsyncSession = Depends(get_db),
):
    """Refresh access token using a valid refresh token."""
    try:
        token_data = decode_refresh_token(payload.refresh_token)
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

    service = AuthService(db)
    user = await service.get_user_by_id(token_data["sub"])
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    access_token = create_access_token(str(user.id), user.role.value)
    new_refresh_token = create_refresh_token(str(user.id), user.role.value)

    set_auth_cookies(response, access_token, new_refresh_token)

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        role=user.role.value,
        user_id=str(user.id),
    )


@router.post("/logout", response_model=MessageResponse)
async def logout(response: Response, _: User = Depends(get_current_user)):
    """Clear auth cookies."""
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")
    return {"message": "Logged out successfully"}


@router.get("/verify-email/{token}", response_model=MessageResponse)
async def verify_email(token: str, db: AsyncSession = Depends(get_db)):
    """Verify user email with the verification token."""
    service = AuthService(db)
    await service.verify_email(token)
    return {"message": "Email verified successfully"}


@router.post("/forgot-password", response_model=MessageResponse)
async def forgot_password(
    payload: ForgotPasswordRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    """Initiate password reset flow."""
    service = AuthService(db)
    token = await service.initiate_password_reset(payload.email)
    if token:
        email_service = EmailService()
        background_tasks.add_task(
            email_service.send_password_reset_email,
            payload.email,
            token,
        )
    # Always return success to prevent email enumeration
    return {"message": "If that email is registered, you will receive reset instructions."}


@router.post("/reset-password", response_model=MessageResponse)
async def reset_password(
    payload: ResetPasswordRequest,
    db: AsyncSession = Depends(get_db),
):
    """Reset password using a valid reset token."""
    service = AuthService(db)
    await service.reset_password(payload.token, payload.new_password)
    return {"message": "Password reset successfully"}


@router.get("/me", response_model=dict)
async def get_me(current_user: User = Depends(get_current_user)):
    """Get current user profile."""
    return {
        "id": str(current_user.id),
        "email": current_user.email,
        "first_name": current_user.first_name,
        "last_name": current_user.last_name,
        "role": current_user.role.value,
        "is_verified": current_user.is_verified,
        "avatar": current_user.avatar,
    }
