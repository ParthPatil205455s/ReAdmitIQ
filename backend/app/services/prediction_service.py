"""Prediction orchestration.

Endpoints stay thin controllers. Everything that turns a patient row into a
persisted prediction with its explanation, recommendations and audit trail
happens here.
"""

from __future__ import annotations

import uuid
from datetime import date
from typing import Any

from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundError
from app.models.admission import Admission
from app.models.explanation import Explanation
from app.models.patient import Patient
from app.models.prediction import Prediction
from app.models.recommendation import Recommendation
from app.services import recommendation as rule_engine
from app.services.explain_service import explain
from app.services.ml_service import build_features, ml_service


def resolve_admission(
    db: Session, patient: Patient, admission_id: uuid.UUID | None
) -> Admission | None:
    """Return the requested admission, or the patient's most recent one."""
    query = db.query(Admission).filter(Admission.patient_id == patient.id)
    if admission_id:
        admission = query.filter(Admission.id == admission_id).first()
        if not admission:
            raise NotFoundError(
                "No admission with that id for this patient.",
                code="ADMISSION_NOT_FOUND",
            )
        return admission
    return query.order_by(Admission.admission_date.desc()).first()


def features_for(
    db: Session,
    patient: Patient,
    admission: Admission | None,
    overrides: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """Build the model feature vector for a patient/admission pair."""
    history = (
        db.query(Admission)
        .filter(Admission.patient_id == patient.id)
        .order_by(Admission.admission_date.desc())
        .all()
    )
    prior = [a for a in history if admission is None or a.id != admission.id]
    prior_count = len(prior)

    days_since = 999
    reference = admission.admission_date if admission else date.today()
    previous_discharges = [
        a.discharge_date
        for a in prior
        if a.discharge_date and a.discharge_date <= reference
    ]
    if previous_discharges:
        days_since = max((reference - max(previous_discharges)).days, 0)

    features = build_features(patient, admission, prior_count, days_since)
    if overrides:
        features.update({k: v for k, v in overrides.items() if v is not None})
    return features


def score(features: dict[str, Any]) -> tuple[float, str, dict[str, Any], list[dict]]:
    """Run inference, explainability and the rule engine over one feature set."""
    probability = ml_service.predict(features)
    band = ml_service.band(probability)
    explanation = explain(features, probability, band)
    recommendations = rule_engine.build(features)
    return probability, band, explanation, recommendations


def persist(
    db: Session,
    *,
    patient: Patient,
    admission: Admission | None,
    features: dict[str, Any],
    probability: float,
    band: str,
    explanation: dict[str, Any],
    recommendations: list[dict[str, Any]],
    created_by: uuid.UUID | None,
) -> Prediction:
    """Write the prediction, its explanation and its recommendations."""
    prediction = Prediction(
        patient_id=patient.id,
        admission_id=admission.id if admission else None,
        created_by=created_by,
        risk_probability=round(float(probability), 6),
        risk_band=band,
        window_days=ml_service.window_days,
        model_version=ml_service.model_version,
        decision_threshold=ml_service.decision_threshold,
        input_features=_jsonable(features),
    )
    db.add(prediction)
    db.flush()

    db.add(
        Explanation(
            prediction_id=prediction.id,
            base_value=explanation["base_value"],
            shap_values=explanation["shap_values"],
            top_drivers=explanation["top_drivers"],
            narrative=explanation["narrative"],
            method=explanation["method"],
        )
    )
    for item in recommendations:
        db.add(Recommendation(prediction_id=prediction.id, **item))

    db.flush()
    return prediction


def _jsonable(features: dict[str, Any]) -> dict[str, Any]:
    """Coerce a feature dict into JSONB-safe primitives."""
    clean: dict[str, Any] = {}
    for key, value in features.items():
        if isinstance(value, (int, float, bool, str)) or value is None:
            clean[key] = value
        else:
            clean[key] = str(value)
    return clean
