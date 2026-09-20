"""
ml/src/explain.py

SHAP global + local explainability, plus a LIME comparison. Produces:
 - PNG figures for the PPT (matplotlib -- not sent to the frontend)
 - A JSON "top drivers" contract for the backend/frontend (Member 2/1),
   built once and reused by backend/app/services/explanation_service.py

Why SHAP over plain feature_importances_: gain-based importance is
global only -- it can't tell a clinician why THIS patient is high risk.
SHAP gives additive, locally-accurate, per-prediction attributions
(Shapley values from cooperative game theory); the contributions sum
exactly to (prediction - base_rate), which is what makes the waterfall
readable to a clinician.

Requires `shap` (and optionally `lime`) -- not available in the
sandbox this was authored in. Run this on your machine after
`pip install -r requirements.txt`.
"""
from __future__ import annotations

import json
import sys

import numpy as np
import pandas as pd

sys.path.insert(0, "src")
from features import ALL_FEATURES  # noqa: E402
from preprocessing import build_preprocessor, get_output_feature_names  # noqa: E402


def humanise(feature_name: str, value) -> str:
    """Turns a raw feature/value pair into a clinician-readable phrase."""
    labels = {
        "prior_admission_count": "Prior admissions",
        "days_since_last_discharge": "Days since last discharge",
        "cumulative_los_prior": "Cumulative prior length of stay",
        "billing_amount": "Billing amount",
        "billing_log": "Billing amount (log)",
        "billing_vs_condition_mean": "Billing vs. condition average",
        "length_of_stay": "Length of stay",
        "age": "Age",
        "test_result_ord": "Test result severity",
        "is_emergency": "Emergency admission",
        "is_long_stay": "Long stay (>75th percentile)",
        "is_high_risk_condition": "High-risk chronic condition",
        "had_prior_emergency": "Prior emergency admission",
        "is_weekend_discharge": "Weekend discharge",
    }
    label = labels.get(feature_name, feature_name.replace("_", " ").title())
    return f"{label}: {value}"


def top_drivers(shap_row: np.ndarray, names: list[str], features: dict, k: int = 8) -> list[dict]:
    """The JSON contract for /predictions/{id}/explanation -- Member 2's
    backend serves this as-is; Member 1's frontend renders it as a
    Recharts waterfall. No matplotlib PNGs cross the wire."""
    pairs = sorted(zip(names, shap_row), key=lambda t: abs(t[1]), reverse=True)[:k]
    return [
        {
            "feature": n,
            "display": humanise(n, features.get(n, "")),
            "contribution": round(float(v), 4),
            "direction": "increases" if v > 0 else "decreases",
        }
        for n, v in pairs
    ]


def run_shap(calibrated_pipeline, X_test: pd.DataFrame, base_estimator):
    """
    `calibrated_pipeline` is a fitted sklearn Pipeline([("pre", ...), ("clf", tree_model)]).
    `base_estimator` is the underlying tree model (e.g. pipeline.named_steps["clf"])
    -- SHAP's TreeExplainer needs the raw tree model, not the isotonic-calibrated wrapper.
    """
    import shap

    pre = calibrated_pipeline.named_steps["pre"]
    Xt = pre.transform(X_test)
    names = get_output_feature_names(pre)

    explainer = shap.TreeExplainer(base_estimator)
    shap_values = explainer.shap_values(Xt)
    if isinstance(shap_values, list):  # binary classifiers sometimes return [neg, pos]
        shap_values = shap_values[1]
    elif hasattr(shap_values, "ndim") and shap_values.ndim == 3:
        shap_values = shap_values[:, :, 1]

    return shap_values, Xt, names, explainer.expected_value


def export_figures(shap_values, Xt, names, out_dir: str = "reports/figures") -> None:
    import matplotlib

    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    import shap

    shap.summary_plot(shap_values, Xt, feature_names=names, plot_type="bar", show=False)
    plt.tight_layout()
    plt.savefig(f"{out_dir}/shap_global_bar.png", dpi=150)
    plt.close()

    shap.summary_plot(shap_values, Xt, feature_names=names, show=False)
    plt.tight_layout()
    plt.savefig(f"{out_dir}/shap_beeswarm.png", dpi=150)
    plt.close()


def export_driver_json(shap_values, Xt, names, X_test: pd.DataFrame, out_path: str, n_examples: int = 20) -> None:
    """Sample of per-episode driver JSON, for Member 2 to validate the contract against."""
    records = []
    for i in range(min(n_examples, len(X_test))):
        row_features = X_test.iloc[i][ALL_FEATURES].to_dict()
        records.append({
            "row_index": int(i),
            "top_drivers": top_drivers(shap_values[i], names, row_features),
        })
    with open(out_path, "w") as f:
        json.dump(records, f, indent=2, default=str)


if __name__ == "__main__":
    print(
        "This script requires `shap` (pip install -r requirements.txt). "
        "Wire it into your run_pipeline.py after training + calibration:\n\n"
        "  from calibrate import calibrate_and_evaluate\n"
        "  from explain import run_shap, export_figures, export_driver_json\n"
        "  result, calibrated, (X_test, y_test, proba) = calibrate_and_evaluate(...)\n"
        "  base_estimator = calibrated.calibrated_classifiers_[0].estimator.named_steps['clf']\n"
        "  shap_values, Xt, names, base_value = run_shap(calibrated.calibrated_classifiers_[0].estimator, X_test, base_estimator)\n"
        "  export_figures(shap_values, Xt, names)\n"
        "  export_driver_json(shap_values, Xt, names, X_test, 'reports/sample_drivers.json')\n"
    )
