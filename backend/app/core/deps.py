"""Shared FastAPI dependencies: database session, current user, RBAC."""

from __future__ import annotations

from typing import Callable, Generator

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import ACCESS_TOKEN_TYPE, decode_token
from app.db.session import SessionLocal
from app.models.user import Role, User
from app.schemas.common import PageParams

oauth2 = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1}/auth/login")


def get_db() -> Generator[Session, None, None]:
    """Yield a scoped SQLAlchemy session and always close it."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user(
    token: str = Depends(oauth2), db: Session = Depends(get_db)
) -> User:
    """Resolve the bearer token to an active user row."""
    payload = decode_token(token)
    if not payload or payload.get("type") != ACCESS_TOKEN_TYPE:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid or expired token")
    user = db.query(User).filter(User.id == payload["sub"]).first()
    if not user or not user.is_active:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "User not found or inactive")
    return user


def require_role(*roles: str) -> Callable[..., User]:
    """Dependency factory enforcing role membership server-side."""
    allowed = {r.value if isinstance(r, Role) else str(r) for r in roles}

    def checker(user: User = Depends(get_current_user)) -> User:
        if user.role.value not in allowed:
            raise HTTPException(status.HTTP_403_FORBIDDEN, "Insufficient permissions")
        return user

    return checker


def get_page_params(
    page: int = 1, size: int = 20, sort: str | None = None
) -> PageParams:
    """Normalise the pagination query string used by every list endpoint."""
    return PageParams(page=max(page, 1), size=min(max(size, 1), 100), sort=sort)


def get_request_id(request: Request) -> str:
    """Correlation id attached by ``RequestContextMiddleware``."""
    return getattr(request.state, "request_id", "req_unknown")


def get_client_ip(request: Request) -> str | None:
    """Best-effort client IP for the audit log."""
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else None
