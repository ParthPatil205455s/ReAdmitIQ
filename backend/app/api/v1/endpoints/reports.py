"""Endpoints 35-36: downloadable clinical PDF reports."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, Request
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.core.deps import get_client_ip, get_current_user, get_db
from app.core.exceptions import NotFoundError
from app.models.admission import Admission
from app.models.prediction import Prediction
from app.models.user import User
from app.services import audit_service
from app.services.pdf_service import build_patient_report, build_prediction_report
from app.api.v1.endpoints.patients import assert_can_read, get_patient_or_404

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.get(
    "/prediction/{prediction_id}/pdf",
    summary="Download the clinical report for one prediction",
    response_class=StreamingResponse,
)
def download_prediction_report(
    prediction_id: uuid.UUID,
    request: Request,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> StreamingResponse:
    prediction = (
        db.query(Prediction).filter(Prediction.id == prediction_id).first()
    )
    if not prediction:
        raise NotFoundError("No prediction with that id.", code="PREDICTION_NOT_FOUND")
    patient = prediction.patient
    assert_can_read(patient, user)
    if not prediction.explanation:
        raise NotFoundError(
            "No explanation stored for that prediction.", code="EXPLANATION_NOT_FOUND"
        )
    recommendations = [
        {
            "driver_code": r.driver_code,
            "title": r.title,
            "detail": r.detail,
            "priority": r.priority,
            "category": r.category,
        }
        for r in prediction.recommendations
    ]
    buf = build_prediction_report(
        prediction, patient, prediction.explanation, recommendations
    )
    audit_service.record(
        db,
        user_id=user.id,
        action="REPORT_DOWNLOAD",
        entity_type="prediction",
        entity_id=prediction.id,
        ip_address=get_client_ip(request),
    )
    db.commit()
    return StreamingResponse(
        buf,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="readmitiq_{patient.mrn}.pdf"'
        },
    )


@router.get(
    "/patient/{patient_id}/pdf",
    summary="Download the longitudinal patient summary",
    response_class=StreamingResponse,
)
def download_patient_report(
    patient_id: uuid.UUID,
    request: Request,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> StreamingResponse:
    patient = get_patient_or_404(db, patient_id)
    assert_can_read(patient, user)
    admissions = (
        db.query(Admission)
        .filter(Admission.patient_id == patient.id)
        .order_by(Admission.admission_date.desc())
        .all()
    )
    predictions = (
        db.query(Prediction)
        .filter(Prediction.patient_id == patient.id)
        .order_by(Prediction.created_at.desc())
        .limit(20)
        .all()
    )
    buf = build_patient_report(patient, admissions, predictions)
    audit_service.record(
        db,
        user_id=user.id,
        action="PATIENT_REPORT_DOWNLOAD",
        entity_type="patient",
        entity_id=patient.id,
        ip_address=get_client_ip(request),
    )
    db.commit()
    return StreamingResponse(
        buf,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="readmitiq_patient_{patient.mrn}.pdf"'
        },
    )
