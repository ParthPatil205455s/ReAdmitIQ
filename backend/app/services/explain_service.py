"""Explainability service.

No LLM is involved. The narrative is a template-based generator over the SHAP
output, so it can never hallucinate a factor the model did not actually use.
"""

from __future__ import annotations

import logging
from typing import Any

from app.services.ml_service import ml_service

log = logging.getLogger("readmitiq.explain")

FEATURE_DISPLAY: dict[str, str] = {
    "prior_admission_count": "a history of {v} prior admissions",
    "length_of_stay": "a hospital stay of {v} days",
    "age": "the patient's age of {v}",
    "admission_type_Emergency": "an emergency admission route",
    "test_result_Abnormal": "abnormal test results at discharge",
    "days_since_last_discharge": "a recent discharge {v} days ago",
    "billing_amount": "the episode cost profile",
    "followup_scheduled": "follow-up scheduling status",
    "admission_type_Urgent": "an urgent admission route",
    "admission_type_Elective": "a planned elective admission",
    "test_result_Normal": "normal test results at discharge",
    "test_result_Inconclusive": "inconclusive test results at discharge",
    "primary_condition_Diabetes": "a primary diagnosis of diabetes",
    "primary_condition_Hypertension": "a primary diagnosis of hypertension",
    "primary_condition_Cancer": "an oncological primary diagnosis",
    "primary_condition_Asthma": "a primary diagnosis of asthma",
    "primary_condition_Obesity": "obesity as the primary condition",
    "primary_condition_Arthritis": "a primary diagnosis of arthritis",
}

_STUB_DRIVERS: list[dict[str, Any]] = [
    {
        "feature": "prior_admission_count",
        "display": "3 prior admissions",
        "contribution": 0.19,
        "direction": "increases",
    },
    {
        "feature": "admission_type_Emergency",
        "display": "Emergency admission",
        "contribution": 0.14,
        "direction": "increases",
    },
    {
        "feature": "length_of_stay",
        "display": "Stay of 14 days",
        "contribution": 0.09,
        "direction": "increases",
    },
    {
        "feature": "age",
        "display": "Age 67",
        "contribution": 0.06,
        "direction": "increases",
    },
    {
        "feature": "test_result_Normal",
        "display": "Normal test results",
        "contribution": -0.05,
        "direction": "decreases",
    },
]


def humanise(feature: str, value: Any) -> str:
    """Render a feature/value pair as a clinician-readable phrase."""
    tpl = FEATURE_DISPLAY.get(feature, feature.replace("_", " "))
    try:
        numeric = float(value)
        return tpl.format(v=int(numeric) if numeric.is_integer() else round(numeric, 1))
    except (TypeError, ValueError):
        return tpl


def explain(
    features: dict[str, Any], probability: float, band: str, top_n: int = 8
) -> dict[str, Any]:
    """Return base value, ranked drivers and the generated narrative."""
    if ml_service.stub:
        base = 0.18
        drivers = [dict(d) for d in _STUB_DRIVERS]
    else:
        frame = ml_service.to_frame(features)
        transformed = ml_service.pre.transform(frame)
        shap_output = ml_service.explainer.shap_values(transformed)

        if isinstance(shap_output, list):
            values = shap_output[1][0] if len(shap_output) > 1 else shap_output[0][0]
        elif hasattr(shap_output, "ndim") and shap_output.ndim == 3:
            values = shap_output[0, :, 1]
        elif hasattr(shap_output, "ndim") and shap_output.ndim == 2:
            values = shap_output[0]
        else:
            values = np.asarray(shap_output).ravel()

        if hasattr(ml_service.pre, "get_feature_names_out"):
            raw_names = ml_service.pre.get_feature_names_out()
            names = [n.split("__", 1)[-1] for n in raw_names]
        else:
            names = ml_service.meta.get("feature_order") or [
                f"feature_{i}" for i in range(len(values))
            ]

        expected = ml_service.explainer.expected_value
        if hasattr(expected, "__len__") and len(expected) > 1:
            base = float(expected[1])
        else:
            base = float(np.ravel(expected)[0])

        pairs = sorted(
            zip(names, values), key=lambda t: abs(float(t[1])), reverse=True
        )[:top_n]
        drivers = [
            {
                "feature": name,
                "display": humanise(name, features.get(name, "")),
                "contribution": round(float(value), 4),
                "direction": "increases" if float(value) > 0 else "decreases",
            }
            for name, value in pairs
        ]

    return {
        "base_value": round(base, 4),
        "top_drivers": drivers,
        "shap_values": {d["feature"]: d["contribution"] for d in drivers},
        "method": "stub-deterministic" if ml_service.stub else "TreeSHAP",
        "narrative": narrate(drivers, probability, band),
    }


def narrate(drivers: list[dict[str, Any]], probability: float, band: str) -> str:
    """Compose the clinical interpretation paragraph from the ranked drivers."""
    up = [d["display"] for d in drivers if d["contribution"] > 0][:3]
    down = [d["display"] for d in drivers if d["contribution"] < 0][:2]
    pct = round(probability * 100)
    window = ml_service.meta.get("window_days", 30)
    text = (
        f"This patient has an estimated {pct}% likelihood of readmission within "
        f"{window} days, placing them in the {band} risk band. "
    )
    if up:
        text += "The strongest contributing factors are " + ", ".join(up) + ". "
    if down:
        text += "Partially offsetting this: " + ", ".join(down) + ". "
    text += (
        "This is a statistical decision-support estimate derived from historical "
        "patterns and is not a medical diagnosis."
    )
    return text
