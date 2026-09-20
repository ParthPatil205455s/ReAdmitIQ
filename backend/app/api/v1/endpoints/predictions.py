"""Endpoints 21-28: prediction, simulation, batch, explanation and model info."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, Query, Request, status
from sqlalchemy.orm import Session

from app.core.deps import (
    get_client_ip,
    get_current_user,
    get_db,
    get_page_params,
    require_role,
)
from app.core.exceptions import NotFoundError
from app.models.patient import Patient
from app.models.prediction import Prediction
from app.models.user import Role, User
from app.schemas.common import Page, PageParams
from app.schemas.prediction import (
    BatchPredictionOut,
    BatchPredictionRequest,
    ExplanationOut,
    GlobalImportance,
    ModelInfo,
    PredictionDetail,
    RecommendationOut,
    PredictionOut,
    PredictionRequest,
    SimulationOut,
    SimulationRequest,
)
from app.services import audit_service, prediction_service
from app.services.analytics_service import top_drivers
from app.services.explain_service import humanise
from app.services.ml_service import ml_service
from app.api.v1.endpoints.patients import assert_can_read, get_patient_or_404

router = APIRouter(prefix="/predictions", tags=["Predictions"])
model_router = APIRouter(prefix="/model", tags=["Model"])


def _detail(prediction: Prediction) -> PredictionDetail:
    """Assemble the full prediction payload from persisted rows."""
    detail = PredictionDetail.model_validate(prediction)
    if prediction.patient:
        detail.patient_name = prediction.patient.full_name
        detail.patient_mrn = prediction.patient.mrn
    if prediction.explanation:
        detail.explanation = ExplanationOut(
            base_value=prediction.explanation.base_value,
            top_drivers=prediction.explanation.top_drivers,
            narrative=prediction.explanation.narrative,
            method=prediction.explanation.method,
        )
    detail.recommendations = [
        RecommendationOut.model_validate(r) for r in prediction.recommendations
    ]
    return detail


@router.post(
    "",
    response_model=PredictionDetail,
    status_code=status.HTTP_201_CREATED,
    summary="Generate and persist a readmission risk prediction",
)
def create_prediction(
    payload: PredictionRequest,
    request: Request,
    db: Session = Depends(get_db),
    user: User = Depends(require_role(Role.DOCTOR, Role.ADMIN)),
) -> PredictionDetail:
    """Persists the prediction, its explanation, its recommendations and an audit row."""
    patient = get_patient_or_404(db, payload.patient_id)
    admission = prediction_service.resolve_admission(db, patient, payload.admission_id)
    features = prediction_service.features_for(
        db, patient, admission, payload.feature_overrides
    )
    probability, band, explanation, recommendations = prediction_service.score(features)
    prediction = prediction_service.persist(
        db,
        patient=patient,
        admission=admission,
        features=features,
        probability=probability,
        band=band,
        explanation=explanation,
        recommendations=recommendations,
        created_by=user.id,
    )
    audit_service.record(
        db,
        user_id=user.id,
        action="PREDICTION_CREATE",
        entity_type="prediction",
        entity_id=prediction.id,
        meta={
            "patient_id": str(patient.id),
            "risk_band": band,
            "model_version": ml_service.model_version,
        },
        ip_address=get_client_ip(request),
    )
    db.commit()
    db.refresh(prediction)
    return _detail(prediction)


@router.post(
    "/simulate",
    response_model=SimulationOut,
    summary="Stateless what-if simulation (nothing is written)",
)
def simulate(
    payload: SimulationRequest,
    _: User = Depends(require_role(Role.DOCTOR, Role.ADMIN)),
) -> SimulationOut:
    """Powers the What-If Simulator.

    A recorded prediction is a clinical decision-support artefact and needs an
    audit trail. A simulation is exploratory - persisting it would pollute the
    audit log and skew the analytics, so nothing here touches the database.
    """
    features = payload.to_features()
    probability, band, explanation, recommendations = prediction_service.score(features)
    return SimulationOut(
        risk_probability=round(probability, 6),
        risk_band=band,
        window_days=ml_service.window_days,
        model_version=ml_service.model_version,
        decision_threshold=ml_service.decision_threshold,
        explanation=ExplanationOut(**{
            "base_value": explanation["base_value"],
            "top_drivers": explanation["top_drivers"],
            "narrative": explanation["narrative"],
            "method": explanation["method"],
        }),
        recommendations=recommendations,
    )


@router.post(
    "/batch",
    response_model=BatchPredictionOut,
    summary="Score a list of patients in one call",
)
def batch_predict(
    payload: BatchPredictionRequest,
    request: Request,
    db: Session = Depends(get_db),
    user: User = Depends(require_role(Role.DOCTOR, Role.ADMIN)),
) -> BatchPredictionOut:
    """One failing patient never aborts the batch."""
    results: list[PredictionOut] = []
    errors: list[str] = []
    for patient_id in payload.patient_ids:
        patient = db.query(Patient).filter(Patient.id == patient_id).first()
        if not patient:
            errors.append(f"{patient_id}: patient not found")
            continue
        try:
            admission = prediction_service.resolve_admission(db, patient, None)
            features = prediction_service.features_for(db, patient, admission)
            probability, band, explanation, recommendations = prediction_service.score(
                features
            )
            prediction = prediction_service.persist(
                db,
                patient=patient,
                admission=admission,
                features=features,
                probability=probability,
                band=band,
                explanation=explanation,
                recommendations=recommendations,
                created_by=user.id,
            )
            results.append(PredictionOut.model_validate(prediction))
        except Exception as exc:
            errors.append(f"{patient_id}: {exc}")

    audit_service.record(
        db,
        user_id=user.id,
        action="PREDICTION_BATCH",
        entity_type="prediction",
        meta={"requested": len(payload.patient_ids), "scored": len(results)},
        ip_address=get_client_ip(request),
    )
    db.commit()
    return BatchPredictionOut(
        scored=len(results), failed=len(errors), results=results, errors=errors
    )


@router.get("", response_model=Page[PredictionOut], summary="Prediction feed")
def list_predictions(
    risk_band: str | None = Query(default=None, pattern="^(LOW|MEDIUM|HIGH)$"),
    patient_id: uuid.UUID | None = Query(default=None),
    params: PageParams = Depends(get_page_params),
    db: Session = Depends(get_db),
    _: User = Depends(require_role(Role.DOCTOR, Role.ADMIN)),
) -> Page[PredictionOut]:
    query = db.query(Prediction)
    if risk_band:
        query = query.filter(Prediction.risk_band == risk_band)
    if patient_id:
        query = query.filter(Prediction.patient_id == patient_id)
    total = query.count()
    rows = (
        query.order_by(Prediction.created_at.desc())
        .offset(params.offset)
        .limit(params.size)
        .all()
    )
    return Page[PredictionOut].build(
        [PredictionOut.model_validate(r) for r in rows], total, params
    )


@router.get(
    "/{prediction_id}", response_model=PredictionDetail, summary="Full prediction payload"
)
def get_prediction(
    prediction_id: uuid.UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> PredictionDetail:
    prediction = _get_prediction(db, prediction_id)
    assert_can_read(prediction.patient, user)
    return _detail(prediction)


@router.get(
    "/{prediction_id}/explanation",
    response_model=ExplanationOut,
    summary="SHAP values and generated narrative",
)
def get_explanation(
    prediction_id: uuid.UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> ExplanationOut:
    prediction = _get_prediction(db, prediction_id)
    assert_can_read(prediction.patient, user)
    if not prediction.explanation:
        raise NotFoundError(
            "No explanation stored for that prediction.", code="EXPLANATION_NOT_FOUND"
        )
    return ExplanationOut(
        base_value=prediction.explanation.base_value,
        top_drivers=prediction.explanation.top_drivers,
        narrative=prediction.explanation.narrative,
        method=prediction.explanation.method,
    )


@model_router.get("/info", response_model=ModelInfo, summary="Model card")
def model_info(_: User = Depends(get_current_user)) -> ModelInfo:
    """Served straight from metadata.json, plus the stated limitations."""
    return ModelInfo(**ml_service.info())


@model_router.get(
    "/global-importance",
    response_model=GlobalImportance,
    summary="Population-level feature importance",
)
def global_importance(
    db: Session = Depends(get_db), _: User = Depends(get_current_user)
) -> GlobalImportance:
    """Mean absolute SHAP contribution across stored explanations."""
    aggregate = top_drivers(db)
    return GlobalImportance(
        model_version=ml_service.model_version,
        method="mean |SHAP| over stored explanations",
        features=[
            {
                "feature": d["feature"],
                "display": d["display"] or humanise(d["feature"], ""),
                "importance": d["average_contribution"],
            }
            for d in aggregate["drivers"]
        ],
    )


def _get_prediction(db: Session, prediction_id: uuid.UUID) -> Prediction:
    prediction = db.query(Prediction).filter(Prediction.id == prediction_id).first()
    if not prediction:
        raise NotFoundError("No prediction with that id.", code="PREDICTION_NOT_FOUND")
    return prediction
