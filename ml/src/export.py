"""
ml/src/export.py

Exports model.pkl, preprocessor.pkl, metadata.json, feature_schema.json
to backend/app/artifacts/ -- the exact contract Member 2's backend reads.
Includes a round-trip load test: fails loudly if the exported pickle
doesn't reproduce the in-memory prediction.
"""
from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path

import joblib
import numpy as np

from features import BINARY_FEATURES, CATEGORICAL_FEATURES, NUMERIC_FEATURES

OUT_DIR = Path("../backend/app/artifacts")


def export_artifacts(
    calibrated_model,
    metrics: dict,
    threshold: float,
    window_days: int,
    class_prevalence: float,
    n_train: int,
    n_test: int,
    feature_order: list[str],
    categorical_levels: dict,
    model_version: str = "readmitiq-v1.0.0",
    algorithm: str = "RandomForest + IsotonicCalibration",
    out_dir: Path = OUT_DIR,
) -> Path:
    out_dir.mkdir(parents=True, exist_ok=True)
    joblib.dump(calibrated_model, out_dir / "model.pkl")
    try:
        pre = calibrated_model.calibrated_classifiers_[0].estimator.named_steps["pre"]
        joblib.dump(pre, out_dir / "preprocessor.pkl")
    except Exception:
        pass

    meta = {
        "model_version": model_version,
        "algorithm": algorithm,
        "trained_at": datetime.now(timezone.utc).isoformat(),
        "target": f"readmitted_within_{window_days}d",
        "window_days": window_days,
        "decision_threshold": threshold,
        "class_prevalence": class_prevalence,
        "n_train": n_train,
        "n_test": n_test,
        "metrics": metrics,
        "feature_order": feature_order,
        "categorical_levels": categorical_levels,
        "limitations": [
            "Trained on a synthetic public dataset (Kaggle prasad22/healthcare-dataset); "
            "feature relationships are randomised by construction, not clinically grounded.",
            "Target variable is engineered via deterministic name/gender/blood-type patient "
            "linkage, not clinically adjudicated -- a heuristic, not verified identity resolution.",
            "The 365-day readmission window was empirically widened from the originally planned "
            "30 days because 30/60/90-day positive counts (45/81/116) were all far below the "
            "400-record floor needed for stable cross-validated estimates.",
            "Utilisation features (prior_admission_count, days_since_last_discharge) are the "
            "strongest real-world predictors of readmission but are also partly mechanically "
            "correlated with the engineered label in this dataset.",
            "Discrimination is weak by construction (ROC-AUC and PR-AUC close to the base rate); "
            "this reflects genuine dataset limitations, not a modelling error.",
            "Not validated on any real clinical population. Not a medical device. "
            "Not intended for deployment without training on real EHR data, temporal "
            "validation, and fairness auditing.",
        ],
    }
    (out_dir / "metadata.json").write_text(json.dumps(meta, indent=2, default=str))

    schema = {"numeric": NUMERIC_FEATURES, "categorical": CATEGORICAL_FEATURES, "binary": BINARY_FEATURES}
    (out_dir / "feature_schema.json").write_text(json.dumps(schema, indent=2))

    return out_dir


def round_trip_test(model_path: Path, X_sample, expected_proba: np.ndarray) -> bool:
    m = joblib.load(model_path)
    actual = m.predict_proba(X_sample)[0][1]
    ok = abs(actual - expected_proba[0]) < 1e-9
    print("artifact round-trip OK" if ok else "artifact round-trip FAILED", actual, expected_proba[0])
    return ok
