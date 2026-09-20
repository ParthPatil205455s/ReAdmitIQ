"""Endpoints 37-39: email alerts and the in-app notification feed."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy.orm import Session

from app.core.deps import (
    get_client_ip,
    get_current_user,
    get_db,
    get_page_params,
    require_role,
)
from app.core.exceptions import NotFoundError
from app.models.notification import Notification
from app.models.prediction import Prediction
from app.models.user import Role, User
from app.schemas.common import Message, Page, PageParams
from app.schemas.notification import EmailAlertRequest, NotificationOut
from app.services import audit_service, notification_service
from app.services.email_service import email_service

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.post("/email", response_model=Message, summary="Send a clinical email alert")
async def send_email_alert(
    payload: EmailAlertRequest,
    request: Request,
    db: Session = Depends(get_db),
    user: User = Depends(require_role(Role.DOCTOR, Role.ADMIN)),
) -> Message:
    """Renders the branded alert template and optionally raises an in-app notice."""
    context: dict = {"subject": payload.subject, "body": payload.body}
    if payload.prediction_id:
        prediction = (
            db.query(Prediction).filter(Prediction.id == payload.prediction_id).first()
        )
        if not prediction:
            raise NotFoundError(
                "No prediction with that id.", code="PREDICTION_NOT_FOUND"
            )
        context.update(
            {
                "patient_name": prediction.patient.full_name,
                "patient_mrn": prediction.patient.mrn,
                "risk_probability": prediction.risk_probability,
                "risk_band": prediction.risk_band,
                "window_days": prediction.window_days,
                "model_version": prediction.model_version,
                "narrative": prediction.explanation.narrative
                if prediction.explanation
                else None,
                "recommendations": [
                    {"priority": r.priority, "title": r.title, "detail": r.detail}
                    for r in prediction.recommendations
                ],
            }
        )

    html = email_service.render_risk_alert(context)
    delivered = await email_service.send(str(payload.to), payload.subject, html)

    if payload.notify_user_id:
        notification_service.create(
            db,
            user_id=payload.notify_user_id,
            title=payload.subject,
            message=payload.body,
            type_="ALERT",
        )
    audit_service.record(
        db,
        user_id=user.id,
        action="EMAIL_ALERT",
        entity_type="notification",
        entity_id=payload.prediction_id,
        meta={"to": str(payload.to), "delivered": delivered},
        ip_address=get_client_ip(request),
    )
    db.commit()
    return Message(
        detail="Alert sent."
        if delivered
        else "SMTP is not configured; the alert was recorded but not emailed."
    )


@router.get("", response_model=Page[NotificationOut], summary="Own notification feed")
def list_notifications(
    unread_only: bool = Query(default=False),
    params: PageParams = Depends(get_page_params),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> Page[NotificationOut]:
    query = db.query(Notification).filter(Notification.user_id == user.id)
    if unread_only:
        query = query.filter(Notification.is_read.is_(False))
    total = query.count()
    rows = (
        query.order_by(Notification.created_at.desc())
        .offset(params.offset)
        .limit(params.size)
        .all()
    )
    return Page[NotificationOut].build(
        [NotificationOut.model_validate(r) for r in rows], total, params
    )


@router.patch(
    "/{notification_id}/read", response_model=NotificationOut, summary="Mark as read"
)
def mark_read(
    notification_id: uuid.UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> Notification:
    notification = (
        db.query(Notification)
        .filter(Notification.id == notification_id, Notification.user_id == user.id)
        .first()
    )
    if not notification:
        raise NotFoundError(
            "No notification with that id.", code="NOTIFICATION_NOT_FOUND"
        )
    notification.is_read = True
    db.commit()
    db.refresh(notification)
    return notification
