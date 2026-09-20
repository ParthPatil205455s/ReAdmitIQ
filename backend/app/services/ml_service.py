"""Inference service.

Stub first, real later. The model, preprocessor and TreeSHAP explainer are
warm-loaded exactly once in the application lifespan - never inside a request
handler (trap 1 in section 17).

When Member 3 drops ``model.pkl``, ``preprocessor.pkl`` and ``metadata.json``
into ``app/artifacts/``, a restart flips ``self.stub`` to ``False`` and not a
single line of endpoint code changes.
"""

from __future__ import annotations

import json
import logging
from datetime import date
from pathlib import Path
from typing import Any

import joblib
import pandas as pd

from app.core.config import settings

log = logging.getLogger("readmitiq.ml")

STUB_META: dict[str, Any] = {
    "model_version": "stub-0.0.1",
    "decision_threshold": 0.5,
    "window_days": 30,
    "feature_order": [],
}


class MLService:
    """Loads the trained artifacts and produces readmission probabilities."""

    def __init__(self) -> None:
        self.model = None
        self.pre = None
        self.meta: dict[str, Any] = dict(STUB_META)
        self.explainer = None
        self.stub: bool = True

    # ------------------------------------------------------------------ load
    def load(self) -> None:
        """Warm-load artifacts. Falls back to stub mode on any failure."""
        d = Path(settings.MODEL_DIR)
        if not (d / "model.pkl").exists():
            alt_d = Path(__file__).resolve().parent.parent / "artifacts"
            if (alt_d / "model.pkl").exists():
                d = alt_d
        try:
            self.model = joblib.load(d / "model.pkl")
            self.meta = json.loads((d / "metadata.json").read_text())
            # Try separate preprocessor first, then extract from bundled model
            try:
                self.pre = joblib.load(d / "preprocessor.pkl")
            except FileNotFoundError:
                # Preprocessor is bundled inside the CalibratedClassifierCV
                try:
                    self.pre = self.model.calibrated_classifiers_[0].estimator.named_steps["pre"]
                except (AttributeError, IndexError, KeyError):
                    self.pre = None
            # SHAP explainer on the base tree estimator
            try:
                import shap
                base_est = self.model.calibrated_classifiers_[0].estimator.named_steps["clf"]
                self.explainer = shap.TreeExplainer(base_est)
            except Exception:
                self.explainer = None
            self.stub = False
            log.info("model_loaded", extra={"model_version": self.meta["model_version"]})
        except Exception as exc:  # stub fallback - never crash the API
            self.model = None
            self.pre = None
            self.explainer = None
            self.stub = True
            self.meta = dict(STUB_META)
            log.warning("stub_mode", extra={"reason": str(exc)})

    # --------------------------------------------------------------- predict
    def predict(self, features: dict[str, Any]) -> float:
        """Return the probability of readmission within the model window."""
        if self.stub:
            # Deterministic pseudo-risk so the frontend sees stable,
            # plausible values long before the real model lands.
            score = (
                features.get("prior_admission_count", 0) * 0.15
                + (0.20 if features.get("admission_type") == "Emergency" else 0)
                + min(features.get("length_of_stay", 0), 30) / 100
                + max(features.get("age", 40) - 40, 0) / 200
            )
            return float(min(max(score, 0.03), 0.95))

        frame = self.to_frame(features)
        return float(self.model.predict_proba(frame)[0][1])

    def to_frame(self, features: dict[str, Any]) -> pd.DataFrame:
        """Build a single-row frame with all engineered features in the exact column order."""
        import numpy as np
        f = dict(features)
        age = int(f.get("age", 50))
        los = int(f.get("length_of_stay", 3))
        adm_type = str(f.get("admission_type", "Elective"))
        test_res = str(f.get("test_result", "Normal"))
        cond = str(f.get("primary_condition", "Diabetes"))
        billing = float(f.get("billing_amount", 10000.0))
        prior_adm = int(f.get("prior_admission_count", 0))

        if "billing_log" not in f:
            f["billing_log"] = float(np.log1p(billing))
        if "billing_vs_condition_mean" not in f:
            f["billing_vs_condition_mean"] = 1.0
        if "test_result_ord" not in f:
            f["test_result_ord"] = {"Normal": 0, "Inconclusive": 1, "Abnormal": 2}.get(test_res, 0)
        if "admission_month" not in f:
            f["admission_month"] = 6
        if "admission_dayofweek" not in f:
            f["admission_dayofweek"] = 2
        if "age_band" not in f:
            f["age_band"] = "<40" if age < 40 else ("40-59" if age < 60 else ("60-74" if age < 75 else "75+"))
        if "los_band" not in f:
            f["los_band"] = "0-3" if los <= 3 else ("4-7" if los <= 7 else ("8-14" if los <= 14 else "15+"))
        if "is_emergency" not in f:
            f["is_emergency"] = 1 if adm_type == "Emergency" else 0
        if "is_long_stay" not in f:
            f["is_long_stay"] = 1 if los > 10 else 0
        if "is_high_risk_condition" not in f:
            f["is_high_risk_condition"] = 1 if cond in ("Diabetes", "Cancer", "Hypertension") else 0
        if "had_prior_emergency" not in f:
            f["had_prior_emergency"] = 1 if (prior_adm > 0 and adm_type == "Emergency") else 0
        if "is_weekend_discharge" not in f:
            f["is_weekend_discharge"] = 0
        if "blood_type" not in f:
            f["blood_type"] = "O+"
        if "cumulative_los_prior" not in f:
            f["cumulative_los_prior"] = prior_adm * 4

        frame = pd.DataFrame([f])
        order = self.meta.get("feature_order") or []
        if order:
            for column in order:
                if column not in frame.columns:
                    frame[column] = 0
            frame = frame[order]
        return frame

    # ------------------------------------------------------------------ misc
    def band(self, p: float) -> str:
        """Map a probability onto the LOW / MEDIUM / HIGH clinical band."""
        if p < settings.RISK_LOW_MAX:
            return "LOW"
        if p < settings.RISK_MED_MAX:
            return "MEDIUM"
        return "HIGH"

    @property
    def model_version(self) -> str:
        return str(self.meta.get("model_version", "stub-0.0.1"))

    @property
    def window_days(self) -> int:
        return int(self.meta.get("window_days", 30))

    @property
    def decision_threshold(self) -> float:
        return float(self.meta.get("decision_threshold", 0.5))

    def info(self) -> dict[str, Any]:
        """Payload for ``GET /model/info``."""
        return {
            "model_version": self.model_version,
            "algorithm": self.meta.get("algorithm", "XGBoostClassifier"),
            "trained_at": self.meta.get("trained_at"),
            "window_days": self.window_days,
            "decision_threshold": self.decision_threshold,
            "metrics": self.meta.get("metrics", {}),
            "feature_order": self.meta.get("feature_order", []),
            "stub_mode": self.stub,
            "limitations": self.meta.get(
                "limitations",
                [
                    "Trained on a public Kaggle healthcare dataset that is synthetic "
                    "in parts; absolute probabilities are not calibrated to any "
                    "specific hospital population.",
                    "The dataset carries no diagnosis codes, comorbidity index or "
                    "medication adherence signal, so those drivers cannot be modelled.",
                    "Readmission is inferred from repeat admission records rather "
                    "than a verified 30-day readmission label.",
                    "Output is clinical decision support, never a medical diagnosis.",
                ],
            ),
        }


def build_features(
    patient: Any,
    admission: Any | None,
    prior_admission_count: int,
    days_since_last_discharge: int,
) -> dict[str, Any]:
    """Assemble the model feature vector from persisted rows.

    PII minimisation: ``full_name``, ``mrn`` and ``contact_email`` are
    deliberately excluded - they never enter the feature vector.
    """
    today = date.today()
    features: dict[str, Any] = {
        "age": int(patient.age or 0),
        "gender": patient.gender,
        "blood_type": getattr(patient, "blood_type", "O+") or "O+",
        "primary_condition": patient.primary_condition,
        "insurance_provider": patient.insurance_provider or "Unknown",
        "prior_admission_count": int(prior_admission_count),
        "days_since_last_discharge": int(days_since_last_discharge),
        "length_of_stay": 0,
        "admission_type": "Elective",
        "test_result": "Normal",
        "medication": "Unknown",
        "billing_amount": 0.0,
        "followup_scheduled": False,
    }
    if admission is not None:
        discharge = admission.discharge_date or today
        features.update(
            {
                "length_of_stay": int(
                    admission.length_of_stay
                    or max((discharge - admission.admission_date).days, 0)
                ),
                "admission_type": admission.admission_type,
                "test_result": admission.test_result or "Normal",
                "medication": admission.medication or "Unknown",
                "billing_amount": float(admission.billing_amount or 0.0),
                "followup_scheduled": bool(admission.followup_scheduled),
            }
        )
    return features


ml_service = MLService()
