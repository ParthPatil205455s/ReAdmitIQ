"""Endpoints 1-6: registration, login, refresh, profile, password change."""

from __future__ import annotations

from fastapi import APIRouter, Depends, Request, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.deps import get_client_ip, get_current_user, get_db
from app.core.exceptions import ConflictError, UnauthorizedError
from app.core.security import (
    REFRESH_TOKEN_TYPE,
    limiter,
    create_refresh_token,
    create_token,
    decode_token,
    hash_password,
    verify_password,
)
from app.models.user import User
from app.schemas.auth import (
    PasswordChange,
    RefreshRequest,
    Token,
    UserCreate,
    UserOut,
    UserUpdate,
)
from app.schemas.common import Message
from app.services import audit_service

router = APIRouter(prefix="/auth", tags=["Auth"])


def _issue(user: User) -> Token:
    return Token(
        access_token=create_token(str(user.id), user.role.value),
        refresh_token=create_refresh_token(str(user.id), user.role.value),
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )


@router.post(
    "/register",
    response_model=UserOut,
    status_code=status.HTTP_201_CREATED,
    summary="Register a DOCTOR or PATIENT account",
)
def register(
    payload: UserCreate, request: Request, db: Session = Depends(get_db)
) -> User:
    """Public self-registration. ADMIN accounts are created only by seeding."""
    if db.query(User).filter(User.email == payload.email).first():
        raise ConflictError("An account with that email already exists.", code="EMAIL_TAKEN")
    user = User(
        email=str(payload.email),
        hashed_password=hash_password(payload.password),
        full_name=payload.full_name,
        role=payload.role,
        specialization=payload.specialization,
    )
    db.add(user)
    db.flush()
    audit_service.record(
        db,
        user_id=user.id,
        action="USER_REGISTER",
        entity_type="user",
        entity_id=user.id,
        meta={"role": user.role.value},
        ip_address=get_client_ip(request),
    )
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=Token, summary="Obtain access + refresh tokens")
@limiter.limit(settings.LOGIN_RATE_LIMIT)
def login(
    request: Request,
    form: OAuth2PasswordRequestForm = Depends(OAuth2PasswordRequestForm),
    db: Session = Depends(get_db),
) -> Token:
    """OAuth2 password flow. ``username`` is the account email."""
    user = db.query(User).filter(User.email == form.username).first()
    if not user or not verify_password(form.password, user.hashed_password):
        raise UnauthorizedError("Incorrect email or password.", code="BAD_CREDENTIALS")
    if not user.is_active:
        raise UnauthorizedError("This account has been deactivated.", code="USER_INACTIVE")
    audit_service.record(
        db,
        user_id=user.id,
        action="USER_LOGIN",
        entity_type="user",
        entity_id=user.id,
        ip_address=get_client_ip(request),
    )
    db.commit()
    return _issue(user)


@router.post("/refresh", response_model=Token, summary="Rotate the access token")
def refresh(payload: RefreshRequest, db: Session = Depends(get_db)) -> Token:
    """Exchange a valid refresh token for a fresh token pair."""
    claims = decode_token(payload.refresh_token)
    if not claims or claims.get("type") != REFRESH_TOKEN_TYPE:
        raise UnauthorizedError("Invalid or expired refresh token.", code="BAD_REFRESH")
    user = db.query(User).filter(User.id == claims["sub"]).first()
    if not user or not user.is_active:
        raise UnauthorizedError("User not found or inactive.", code="USER_INACTIVE")
    return _issue(user)


@router.get("/me", response_model=UserOut, summary="Current profile and role")
def me(user: User = Depends(get_current_user)) -> User:
    return user


@router.patch("/me", response_model=UserOut, summary="Update own profile")
def update_me(
    payload: UserUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> User:
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(user, field, value)
    db.commit()
    db.refresh(user)
    return user


@router.post(
    "/change-password", response_model=Message, summary="Change own password"
)
def change_password(
    payload: PasswordChange,
    request: Request,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> Message:
    """Requires the current password - never a bare reset."""
    if not verify_password(payload.current_password, user.hashed_password):
        raise UnauthorizedError("Current password is incorrect.", code="BAD_PASSWORD")
    user.hashed_password = hash_password(payload.new_password)
    audit_service.record(
        db,
        user_id=user.id,
        action="PASSWORD_CHANGE",
        entity_type="user",
        entity_id=user.id,
        ip_address=get_client_ip(request),
    )
    db.commit()
    return Message(detail="Password updated successfully.")
