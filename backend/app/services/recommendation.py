"""Deterministic clinical recommendation rule engine.

Each rule fires off the same feature vector the model consumed, so every
recommendation shown to a clinician is traceable to a concrete, inspectable
condition rather than to a generative model.
"""

from __future__ import annotations

from typing import Any, Callable

RULES: dict[str, dict[str, Any]] = {
    "PRIOR_UTILISATION": dict(
        trigger=lambda f: f.get("prior_admission_count", 0) >= 2,
        title="Assign a care coordinator",
        detail=(
            "Repeat utilisation is the dominant driver. Enrol the patient in the "
            "30-day transitional care programme before discharge."
        ),
        priority="HIGH",
        category="FOLLOWUP",
    ),
    "EMERGENCY_ADMIT": dict(
        trigger=lambda f: f.get("admission_type") == "Emergency",
        title="Schedule a 7-day outpatient review",
        detail=(
            "Unplanned admissions correlate with incomplete recovery. Book a "
            "review within 7 days of discharge."
        ),
        priority="HIGH",
        category="MONITORING",
    ),
    "EXTENDED_LOS": dict(
        trigger=lambda f: f.get("length_of_stay", 0) >= 10,
        title="Home-health and mobility assessment",
        detail=(
            "Extended stays are associated with deconditioning. Arrange a home "
            "assessment and mobility screen."
        ),
        priority="HIGH",
        category="FOLLOWUP",
    ),
    "ABNORMAL_TESTS": dict(
        trigger=lambda f: f.get("test_result") == "Abnormal",
        title="Repeat laboratory tests at 14 days",
        detail=(
            "Abnormal results at discharge warrant repeat testing and a flag to "
            "the attending physician."
        ),
        priority="HIGH",
        category="MONITORING",
    ),
    "ADVANCED_AGE": dict(
        trigger=lambda f: f.get("age", 0) >= 70,
        title="Geriatric care review",
        detail=(
            "Conduct a fall-risk assessment and polypharmacy review before "
            "discharge."
        ),
        priority="MEDIUM",
        category="MONITORING",
    ),
    "RAPID_RETURN": dict(
        trigger=lambda f: 0 < f.get("days_since_last_discharge", 999) < 45,
        title="Root-cause review of the previous discharge",
        detail=(
            "A rapid return suggests the previous discharge plan was incomplete. "
            "Review before repeating it."
        ),
        priority="HIGH",
        category="FOLLOWUP",
    ),
    "NO_FOLLOWUP": dict(
        trigger=lambda f: not f.get("followup_scheduled", False),
        title="Book follow-up before discharge",
        detail=(
            "Scheduling a follow-up appointment prior to discharge is the single "
            "highest-yield modifiable intervention."
        ),
        priority="HIGH",
        category="FOLLOWUP",
    ),
    "CHRONIC_CONDITION": dict(
        trigger=lambda f: f.get("primary_condition")
        in ("Diabetes", "Hypertension", "Cancer"),
        title="Condition-specific education pack",
        detail=(
            "Provide a self-monitoring log and condition education material "
            "appropriate to the primary diagnosis."
        ),
        priority="MEDIUM",
        category="EDUCATION",
    ),
}

ORDER: dict[str, int] = {"HIGH": 0, "MEDIUM": 1, "LOW": 2}


def build(features: dict[str, Any]) -> list[dict[str, Any]]:
    """Evaluate every rule and return the top six by priority."""
    out = [
        {"driver_code": code, **{k: v for k, v in rule.items() if k != "trigger"}}
        for code, rule in RULES.items()
        if _safe(rule["trigger"], features)
    ]
    return sorted(out, key=lambda r: ORDER[r["priority"]])[:6]


def _safe(trigger: Callable[[dict[str, Any]], bool], features: dict[str, Any]) -> bool:
    """A malformed feature must never take down a prediction request."""
    try:
        return bool(trigger(features))
    except (TypeError, ValueError):
        return False
