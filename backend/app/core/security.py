"""Password hashing and JWT issue/verify helpers.

bcrypt cost 12, HS256 tokens, ``sub`` is always the user UUID as a string.
"""

from datetime import datetime, timedelta, timezone
from typing import Any

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings

pwd = CryptContext(schemes=["bcrypt"], deprecated="auto", bcrypt__rounds=12)

ACCESS_TOKEN_TYPE = "access"
REFRESH_TOKEN_TYPE = "refresh"


def hash_password(raw: str) -> str:
    """Hash a plaintext password with bcrypt (cost 12)."""
    return pwd.hash(raw)


def verify_password(raw: str, hashed: str) -> bool:
    """Constant-time verification of a plaintext password against its hash."""
    return pwd.verify(raw, hashed)


def create_token(sub: str, role: str, minutes: int | None = None) -> str:
    """Issue a short-lived access token."""
    exp = datetime.now(timezone.utc) + timedelta(
        minutes=minutes or settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )
    return jwt.encode(
        {"sub": sub, "role": role, "type": ACCESS_TOKEN_TYPE, "exp": exp},
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM,
    )


def create_refresh_token(sub: str, role: str, days: int | None = None) -> str:
    """Issue a long-lived refresh token used only by ``POST /auth/refresh``."""
    exp = datetime.now(timezone.utc) + timedelta(
        days=days or settings.REFRESH_TOKEN_EXPIRE_DAYS
    )
    return jwt.encode(
        {"sub": sub, "role": role, "type": REFRESH_TOKEN_TYPE, "exp": exp},
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM,
    )


def decode_token(token: str) -> dict[str, Any] | None:
    """Decode and validate a JWT. Returns ``None`` when invalid or expired."""
    try:
        return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except JWTError:
        return None


# ---------------------------------------------------------------------------
# Rate limiting. Applied to POST /auth/login (5 requests per minute per IP) and
# registered on the application in main.py.
# ---------------------------------------------------------------------------
from slowapi import Limiter  # noqa: E402
from slowapi.util import get_remote_address  # noqa: E402

limiter = Limiter(key_func=get_remote_address, default_limits=[])
