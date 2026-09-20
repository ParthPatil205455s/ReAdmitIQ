"""Prediction, explanation and recommendation DTOs.

These shapes are the frozen 12:00 API contract. The stub predictor and the
real XGBoost model return exactly the same structure - that is what lets the
frontend integrate six hours before the model exists.
"""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.admission import ADMISSION_TYPES, TEST_RESULTS


class PredictionRequest(BaseModel):
    """Body for ``POST /predictions``."""

    patient_id: uuid.UUID
    admission_id: uuid.UUID | None = Field(
        default=None,
        description="Defaults to the patient's most recent admission.",
    )
    feature_overrides: dict[str, Any] | None = Field(
        default=None,
        description="Optional clinician overrides applied on top of stored data.",
    )


class SimulationRequest(BaseModel):
    """Body for ``POST /predictions/simulate`` - stateless, nothing is written."""

    age: int = Field(..., ge=0, le=120)
    prior_admission_count: int = Field(0, ge=0, le=50)
    length_of_stay: int = Field(0, ge=0, le=365)
    admission_type: str = "Elective"
    test_result: str = "Normal"
    primary_condition: str = "Diabetes"
    billing_amount: float = Field(0.0, ge=0)
    days_since_last_discharge: int = Field(999, ge=0)
    followup_scheduled: bool = False
    gender: str = "Male"

    def to_features(self) -> dict[str, Any]:
        payload = self.model_dump()
        if payload["admission_type"] not in ADMISSION_TYPES:
            payload["admission_type"] = "Elective"
        if payload["test_result"] not in TEST_RESULTS:
            payload["test_result"] = "Normal"
        return payload


class BatchPredictionRequest(BaseModel):
    """Body for ``POST /predictions/batch``."""

    patient_ids: list[uuid.UUID] = Field(..., min_length=1, max_length=200)


class Driver(BaseModel):
    """One SHAP contribution rendered for a human reader."""

    feature: str
    display: str
    contribution: float
    direction: str


class ExplanationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    base_value: float
    top_drivers: list[Driver]
    narrative: str
    method: str = "TreeSHAP"


class RecommendationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    driver_code: str
    title: str
    detail: str
    priority: str
    category: str


class PredictionOut(BaseModel):
    """The frozen prediction contract."""

    model_config = ConfigDict(from_attributes=True, protected_namespaces=())

    id: uuid.UUID | None = None
    patient_id: uuid.UUID | None = None
    admission_id: uuid.UUID | None = None
    risk_probability: float
    risk_band: str
    window_days: int
    model_version: str
    decision_threshold: float
    input_features: dict[str, Any] = Field(default_factory=dict)
    created_at: datetime | None = None


class PredictionDetail(PredictionOut):
    """Full payload returned by ``POST /predictions`` and ``GET /predictions/{id}``."""

    patient_name: str | None = None
    patient_mrn: str | None = None
    explanation: ExplanationOut | None = None
    recommendations: list[RecommendationOut] = Field(default_factory=list)


class SimulationOut(BaseModel):
    """Stateless simulator response - no identifiers, nothing persisted."""

    model_config = ConfigDict(protected_namespaces=())

    risk_probability: float
    risk_band: str
    window_days: int
    model_version: str
    decision_threshold: float
    explanation: ExplanationOut
    recommendations: list[RecommendationOut]


class BatchPredictionOut(BaseModel):
    scored: int
    failed: int
    results: list[PredictionOut]
    errors: list[str] = Field(default_factory=list)


class ModelInfo(BaseModel):
    """``GET /model/info`` - served straight from metadata.json."""

    model_config = ConfigDict(protected_namespaces=())

    model_version: str
    algorithm: str | None = None
    trained_at: str | None = None
    window_days: int
    decision_threshold: float
    metrics: dict[str, Any] = Field(default_factory=dict)
    feature_order: list[str] = Field(default_factory=list)
    stub_mode: bool
    limitations: list[str] = Field(default_factory=list)


class GlobalImportanceItem(BaseModel):
    feature: str
    display: str
    importance: float


class GlobalImportance(BaseModel):
    model_config = ConfigDict(protected_namespaces=())

    model_version: str
    method: str
    features: list[GlobalImportanceItem]
