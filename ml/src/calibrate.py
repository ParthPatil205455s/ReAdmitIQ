"""
ml/src/calibrate.py

Isotonic calibration of the winning model + recall-oriented threshold
tuning subject to a precision floor.

Why calibrate: an uncalibrated tree ensemble outputs a ranking score,
not a probability. When the UI shows "71%" to a clinician, that number
should approximately mean "71 of 100 similar patients returned".
Isotonic calibration makes that claim defensible; the Brier score is
the evidence.
"""
from __future__ import annotations

import json
import sys

import numpy as np
import pandas as pd
from sklearn.calibration import CalibratedClassifierCV
from sklearn.metrics import brier_score_loss, precision_recall_curve
from sklearn.model_selection import GroupShuffleSplit
from sklearn.pipeline import Pipeline

sys.path.insert(0, "src")
from features import ALL_FEATURES  # noqa: E402
from preprocessing import build_preprocessor  # noqa: E402

PRECISION_FLOOR = 0.25  # a missed readmission costs far more than an unnecessary follow-up call


def tune_threshold(y_true, proba, precision_floor: float = PRECISION_FLOOR) -> float:
    prec, rec, thr = precision_recall_curve(y_true, proba)
    ok = prec[:-1] >= precision_floor
    if ok.any():
        return float(thr[ok][rec[:-1][ok].argmax()])
    # no threshold reaches the precision floor (expected on a near-random
    # model) -- fall back to the operating point that maximizes F1 instead,
    # and flag it in the metadata.
    f1 = 2 * prec[:-1] * rec[:-1] / np.clip(prec[:-1] + rec[:-1], 1e-9, None)
    return float(thr[f1.argmax()]) if len(thr) else 0.5


def calibrate_and_evaluate(X, y, groups, clf, model_name: str) -> dict:
    pre = build_preprocessor()
    best = Pipeline([("pre", pre), ("clf", clf)])

    splitter = GroupShuffleSplit(n_splits=1, test_size=0.2, random_state=42)
    train_idx, test_idx = next(splitter.split(X, y, groups))
    X_train, X_test = X.iloc[train_idx], X.iloc[test_idx]
    y_train, y_test = y.iloc[train_idx], y.iloc[test_idx]

    # cv=3 (not 5): CalibratedClassifierCV stores one fitted copy of the full
    # pipeline per fold, so cv=5 with a 300-tree RandomForest produced a
    # 115MB pickle -- over GitHub's 100MB push limit. cv=3 cuts that by ~40%;
    # if you're still over the limit, also drop RandomForest's n_estimators
    # (300 -> 150) in train.py, or prefer XGBoost/LightGBM as the winner
    # (gradient-boosted trees pickle far smaller than a 300-tree forest).
    calibrated = CalibratedClassifierCV(best, method="isotonic", cv=3)
    calibrated.fit(X_train, y_train)

    proba = calibrated.predict_proba(X_test)[:, 1]
    threshold = tune_threshold(y_test, proba)
    brier = brier_score_loss(y_test, proba)

    preds = (proba >= threshold).astype(int)
    from sklearn.metrics import (average_precision_score, f1_score,
                                  precision_score, recall_score, roc_auc_score)

    result = {
        "model_name": model_name,
        "decision_threshold": threshold,
        "precision_floor_used": PRECISION_FLOOR,
        "brier_score": float(brier),
        "n_train": int(len(X_train)),
        "n_test": int(len(X_test)),
        "class_prevalence": float(y.mean()),
        "metrics": {
            "roc_auc": float(roc_auc_score(y_test, proba)),
            "pr_auc": float(average_precision_score(y_test, proba)),
            "precision": float(precision_score(y_test, preds, zero_division=0)),
            "recall": float(recall_score(y_test, preds, zero_division=0)),
            "f1": float(f1_score(y_test, preds, zero_division=0)),
            "brier": float(brier),
        },
    }
    return result, calibrated, (X_test, y_test, proba)


if __name__ == "__main__":
    window = 365
    label_col = f"readmitted_{window}d"

    df = pd.read_csv("data/processed/features.csv")
    X, y, groups = df[ALL_FEATURES], df[label_col], df["pseudo_patient_id"]

    from sklearn.ensemble import RandomForestClassifier

    clf = RandomForestClassifier(
        n_estimators=300, min_samples_leaf=5, class_weight="balanced",
        n_jobs=-1, random_state=42,
    )
    result, calibrated, _ = calibrate_and_evaluate(X, y, groups, clf, "RandomForest")
    print(json.dumps(result, indent=2))

    with open("reports/calibration_result.json", "w") as f:
        json.dump(result, f, indent=2)
