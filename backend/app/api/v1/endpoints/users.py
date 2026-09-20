"""Endpoints 7-9: administrative user management."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy.orm import Session

from app.core.deps import get_client_ip, get_db, get_page_params, require_role
from app.core.exceptions import ForbiddenError, NotFoundError
from app.models.user import Role, User
from app.schemas.auth import UserOut, UserStatusUpdate
from app.schemas.common import Message, Page, PageParams
from app.services import audit_service

router = APIRouter(prefix="/users", tags=["Users"])


def _get_user(db: Session, user_id: uuid.UUID) -> User:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise NotFoundError("No user with that id.", code="USER_NOT_FOUND")
    return user


@router.get("", response_model=Page[UserOut], summary="List users (paginated)")
def list_users(
    role: Role | None = Query(default=None, description="Filter by role"),
    search: str | None = Query(default=None, description="Match name or email"),
    params: PageParams = Depends(get_page_params),
    db: Session = Depends(get_db),
    _: User = Depends(require_role(Role.ADMIN)),
) -> Page[UserOut]:
    query = db.query(User)
    if role:
        query = query.filter(User.role == role)
    if search:
        pattern = f"%{search.strip()}%"
        query = query.filter(
            User.full_name.ilike(pattern) | User.email.ilike(pattern)
        )
    total = query.count()
    rows = (
        query.order_by(User.created_at.desc())
        .offset(params.offset)
        .limit(params.size)
        .all()
    )
    return Page[UserOut].build([UserOut.model_validate(r) for r in rows], total, params)


@router.patch(
    "/{user_id}/status", response_model=UserOut, summary="Activate or deactivate"
)
def set_status(
    user_id: uuid.UUID,
    payload: UserStatusUpdate,
    request: Request,
    db: Session = Depends(get_db),
    admin: User = Depends(require_role(Role.ADMIN)),
) -> User:
    user = _get_user(db, user_id)
    if user.id == admin.id:
        raise ForbiddenError(
            "An administrator cannot change their own status.",
            code="SELF_STATUS_CHANGE",
        )
    user.is_active = payload.is_active
    audit_service.record(
        db,
        user_id=admin.id,
        action="USER_STATUS_UPDATE",
        entity_type="user",
        entity_id=user.id,
        meta={"is_active": payload.is_active},
        ip_address=get_client_ip(request),
    )
    db.commit()
    db.refresh(user)
    return user


@router.delete("/{user_id}", response_model=Message, summary="Soft delete a user")
def soft_delete(
    user_id: uuid.UUID,
    request: Request,
    db: Session = Depends(get_db),
    admin: User = Depends(require_role(Role.ADMIN)),
) -> Message:
    """Soft delete: the row is retained so audit history stays referentially intact."""
    user = _get_user(db, user_id)
    if user.id == admin.id:
        raise ForbiddenError(
            "An administrator cannot delete their own account.", code="SELF_DELETE"
        )
    user.is_active = False
    audit_service.record(
        db,
        user_id=admin.id,
        action="USER_SOFT_DELETE",
        entity_type="user",
        entity_id=user.id,
        ip_address=get_client_ip(request),
    )
    db.commit()
    return Message(detail="User deactivated.")
