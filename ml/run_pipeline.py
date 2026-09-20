"""
ml/run_pipeline.py

End-to-end orchestrator: clean -> link -> label -> features -> compare
models -> calibrate winner -> (SHAP if available) -> export artifacts ->
evaluation figures -> MODEL_CARD.md numbers.

Run from ml/:  python run_pipeline.py
"""
from __future__ import annotations

import json
import sys
import warnings
from pathlib import Path

warnings.filterwarnings("ignore", category=UserWarning)

sys.path.insert(0, "src")

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from sklearn.calibration import calibration_curve
from sklearn.metrics import (RocCurveDisplay, PrecisionRecallDisplay,
                              ConfusionMatrixDisplay, confusion_matrix)

from clean import clean
from linkage import add_pseudo_id
from labeling import prevalence_table, choose_window, label
from features import ALL_FEATURES, build_features
from train import compare_models, build_models
from calibrate import calibrate_and_evaluate
from export import export_artifacts, round_trip_test

REPORTS = Path("reports")
FIGURES = REPORTS / "figures"
FIGURES.mkdir(parents=True, exist_ok=True)


def main():
    print("=== 1/8 Cleaning ===")
    df, clean_report = clean("data/raw/healthcare_dataset.csv")
    (REPORTS / "cleaning_report.json").write_text(json.dumps(clean_report.as_dict(), indent=2, default=str))
    print(clean_report.as_dict())

    print("\n=== 2/8 Patient linkage ===")
    df = add_pseudo_id(df)

    print("\n=== 3/8 Label engineering ===")
    prev = prevalence_table(df)
    window, reason = choose_window(prev)
    print(prev.to_string(index=False))
    print(f"Chosen window: {window}d\n{reason}")
    prev.to_csv(REPORTS / "prevalence_table.csv", index=False)
    (REPORTS / "window_decision.json").write_text(json.dumps(
        {"chosen_window_days": window, "reason": reason}, indent=2))

    # prevalence chart
    plt.figure(figsize=(6, 4))
    plt.bar(prev["window_days"].astype(str) + "d", prev["prevalence_pct"])
    plt.ylabel("Prevalence (%)")
    plt.title("Readmission prevalence by window")
    plt.tight_layout()
    plt.savefig(FIGURES / "prevalence.png", dpi=150)
    plt.close()

    labeled = label(df, window=window)
    label_col = f"readmitted_{window}d"

    print("\n=== 4/8 Feature engineering ===")
    feats = build_features(labeled)
    assert feats[ALL_FEATURES].isna().sum().sum() == 0, "nulls in feature matrix"
    feats.to_csv("data/processed/features.csv", index=False)
    print(f"features: {feats.shape}, positive rate {feats[label_col].mean():.4%}")

    X, y, groups = feats[ALL_FEATURES], feats[label_col], feats["pseudo_patient_id"]

    print("\n=== 5/8 Model comparison (grouped CV) ===")
    comparison = compare_models(X, y, groups)
    comparison.to_csv(REPORTS / "model_comparison.csv", index=False)
    print(comparison.drop(columns=["mean_pr_auc", "mean_recall", "mean_fit_time"]).to_string(index=False))

    plt.figure(figsize=(7, 4))
    plt.barh(comparison["model"], comparison["mean_pr_auc"])
    plt.xlabel("Mean PR-AUC (grouped CV)")
    plt.title("Model comparison")
    plt.tight_layout()
    plt.savefig(FIGURES / "comparison.png", dpi=150)
    plt.close()

    winner_name = comparison.iloc[0]["model"]
    print(f"\nWinner (by mean PR-AUC): {winner_name}")

    print("\n=== 6/8 Calibration & threshold tuning ===")
    winner_clf = build_models(y)[winner_name]
    result, calibrated, (X_test, y_test, proba) = calibrate_and_evaluate(X, y, groups, winner_clf, winner_name)
    (REPORTS / "calibration_result.json").write_text(json.dumps(result, indent=2))
    print(json.dumps(result, indent=2))

    # confusion matrix at tuned threshold
    preds = (proba >= result["decision_threshold"]).astype(int)
    cm = confusion_matrix(y_test, preds)
    ConfusionMatrixDisplay(cm).plot()
    plt.title(f"Confusion matrix @ threshold={result['decision_threshold']:.4f}")
    plt.tight_layout()
    plt.savefig(FIGURES / "cm.png", dpi=150)
    plt.close()

    RocCurveDisplay.from_predictions(y_test, proba)
    plt.title("ROC curve")
    plt.tight_layout()
    plt.savefig(FIGURES / "roc.png", dpi=150)
    plt.close()

    PrecisionRecallDisplay.from_predictions(y_test, proba)
    plt.title("Precision-Recall curve")
    plt.tight_layout()
    plt.savefig(FIGURES / "pr.png", dpi=150)
    plt.close()

    frac_pos, mean_pred = calibration_curve(y_test, proba, n_bins=10, strategy="quantile")
    plt.figure(figsize=(5, 5))
    plt.plot(mean_pred, frac_pos, marker="o", label="model")
    plt.plot([0, 1], [0, 1], linestyle="--", color="gray", label="perfect calibration")
    plt.xlabel("Mean predicted probability")
    plt.ylabel("Fraction of positives")
    plt.title(f"Calibration curve (Brier={result['brier_score']:.4f})")
    plt.legend()
    plt.tight_layout()
    plt.savefig(FIGURES / "calibration.png", dpi=150)
    plt.close()

    print("\n=== 7/8 SHAP explainability ===")
    try:
        import shap  # noqa
        from explain import run_shap, export_figures, export_driver_json

        print("  Calculating SHAP attributions on 1,000 sample records...", flush=True)
        base_estimator = calibrated.calibrated_classifiers_[0].estimator.named_steps["clf"]
        X_shap_sample = X_test.iloc[:1000]
        shap_values, Xt, names, base_value = run_shap(
            calibrated.calibrated_classifiers_[0].estimator, X_shap_sample, base_estimator)
        export_figures(shap_values, Xt, names)
        export_driver_json(shap_values, Xt, names, X_shap_sample, str(REPORTS / "sample_drivers.json"))
        print("  SHAP figures + driver JSON exported.")
    except ImportError:
        print("shap not installed in this environment -- skipped. "
              "Run `pip install -r requirements.txt` then re-run this script "
              "before your final submission; SHAP is a scored deliverable.")

    print("\n=== 8/8 Export artifacts ===")
    categorical_levels = {
        col: sorted(X[col].dropna().astype(str).unique().tolist())
        for col in ["gender", "blood_type", "primary_condition", "admission_type",
                    "medication", "insurance_provider", "age_band", "los_band"]
    }
    out_dir = export_artifacts(
        calibrated_model=calibrated,
        metrics=result["metrics"],
        threshold=result["decision_threshold"],
        window_days=window,
        class_prevalence=result["class_prevalence"],
        n_train=result["n_train"],
        n_test=result["n_test"],
        feature_order=ALL_FEATURES,
        categorical_levels=categorical_levels,
        model_version=f"readmitiq-{winner_name.lower()}-1.0.0",
        algorithm=f"{winner_name} + IsotonicCalibration",
    )
    round_trip_test(out_dir / "model.pkl", X_test.iloc[:1], proba[:1])
    print(f"Artifacts written to {out_dir.resolve()}")

    print("\nPIPELINE COMPLETE")


if __name__ == "__main__":
    main()
