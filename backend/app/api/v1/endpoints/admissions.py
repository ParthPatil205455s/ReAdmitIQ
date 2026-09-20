"""Endpoints 18-20: admission read, update and delete."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from app.core.deps import get_client_ip, get_db, require_role
from app.core.exceptions import NotFoundError
from app.models.admission import Admission
from app.models.user import Role, User
from app.schemas.admission import AdmissionOut, AdmissionUpdate
from app.schemas.common import Message
from app.services import audit_service

router = APIRouter(prefix="/admissions", tags=["Admissions"])


def _get(db: Session, admission_id: uuid.UUID) -> Admission:
    admission = db.query(Admission).filter(Admission.id == admission_id).first()
    if not admission:
        raise NotFoundError("No admission with that id.", code="ADMISSION_NOT_FOUND")
    return admission


@router.get("/{admission_id}", response_model=AdmissionOut, summary="Admission detail")
def get_admission(
    admission_id: uuid.UUID,
    db: Session = Depends(get_db),
    _: User = Depends(require_role(Role.DOCTOR, Role.ADMIN)),
) -> Admission:
    return _get(db, admission_id)


@router.put("/{admission_id}", response_model=AdmissionOut, summary="Update admission")
def update_admission(
    admission_id: uuid.UUID,
    payload: AdmissionUpdate,
    request: Request,
    db: Session = Depends(get_db),
    user: User = Depends(require_role(Role.DOCTOR, Role.ADMIN)),
) -> Admission:
    admission = _get(db, admission_id)
    for field, value in payload.model_dump().items():
        setattr(admission, field, value)
    admission.length_of_stay = payload.computed_length_of_stay
    audit_service.record(
        db,
        user_id=user.id,
        action="ADMISSION_UPDATE",
        entity_type="admission",
        entity_id=admission.id,
        ip_address=get_client_ip(request),
    )
    db.commit()
    db.refresh(admission)
    return admission


@router.delete("/{admission_id}", response_model=Message, summary="Delete admission")
def delete_admission(
    admission_id: uuid.UUID,
    request: Request,
    db: Session = Depends(get_db),
    admin: User = Depends(require_role(Role.ADMIN)),
) -> Message:
    admission = _get(db, admission_id)
    audit_service.record(
        db,
        user_id=admin.id,
        action="ADMISSION_DELETE",
        entity_type="admission",
        entity_id=admission.id,
        meta={"patient_id": str(admission.patient_id)},
        ip_address=get_client_ip(request),
    )
    db.delete(admission)
    db.commit()
    return Message(detail="Admission deleted.")
