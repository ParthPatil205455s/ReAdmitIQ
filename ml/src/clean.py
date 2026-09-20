"""
ml/src/clean.py

Loads the raw Kaggle healthcare_dataset.csv and produces a cleaned,
typed DataFrame. Reports every transformation so the numbers can be
quoted in the notebook / PPT (Data Preprocessing is an explicit
evaluation criterion).
"""
from __future__ import annotations

import logging
from dataclasses import dataclass, field

import pandas as pd

logger = logging.getLogger(__name__)

RENAME = {
    "Name": "name",
    "Age": "age",
    "Gender": "gender",
    "Blood Type": "blood_type",
    "Medical Condition": "primary_condition",
    "Date of Admission": "admission_date",
    "Doctor": "doctor",
    "Hospital": "hospital",
    "Insurance Provider": "insurance_provider",
    "Billing Amount": "billing_amount",
    "Room Number": "room_number",
    "Admission Type": "admission_type",
    "Discharge Date": "discharge_date",
    "Medication": "medication",
    "Test Results": "test_result",
}


@dataclass
class CleaningReport:
    """Every number you need for the 'Data Preprocessing' slide."""

    rows_before: int = 0
    rows_after: int = 0
    duplicates_removed: int = 0
    impossible_dates_removed: int = 0
    invalid_age_removed: int = 0
    null_dates_removed: int = 0
    negative_billing_corrected: int = 0
    null_counts_before: dict = field(default_factory=dict)

    def as_dict(self) -> dict:
        return {
            "rows_before": self.rows_before,
            "rows_after": self.rows_after,
            "rows_dropped_total": self.rows_before - self.rows_after,
            "duplicates_removed": self.duplicates_removed,
            "impossible_dates_removed": self.impossible_dates_removed,
            "invalid_age_removed": self.invalid_age_removed,
            "null_dates_removed": self.null_dates_removed,
            "negative_billing_corrected": self.negative_billing_corrected,
            "null_counts_before": self.null_counts_before,
        }


def clean(path: str) -> tuple[pd.DataFrame, CleaningReport]:
    report = CleaningReport()

    df = pd.read_csv(path).rename(columns=RENAME)
    report.rows_before = len(df)
    report.null_counts_before = df.isna().sum().to_dict()

    # --- dtype coercion ---
    df["admission_date"] = pd.to_datetime(df["admission_date"], errors="coerce")
    df["discharge_date"] = pd.to_datetime(df["discharge_date"], errors="coerce")
    df["billing_amount"] = pd.to_numeric(df["billing_amount"], errors="coerce")
    df["age"] = pd.to_numeric(df["age"], errors="coerce")

    # --- name normalisation (for the pseudo-ID linkage key only) ---
    df["name_norm"] = (
        df["name"].astype(str).str.strip().str.lower().str.replace(r"\s+", " ", regex=True)
    )

    # --- duplicates ---
    before = len(df)
    df = df.drop_duplicates()
    report.duplicates_removed = before - len(df)

    # --- null admission/discharge/age ---
    before = len(df)
    df = df.dropna(subset=["admission_date", "discharge_date", "age"])
    report.null_dates_removed = before - len(df)

    # --- impossible episodes: discharge before admission ---
    before = len(df)
    df = df[df["discharge_date"] >= df["admission_date"]]
    report.impossible_dates_removed = before - len(df)

    # --- implausible ages ---
    before = len(df)
    df = df[(df["age"] >= 0) & (df["age"] <= 120)]
    report.invalid_age_removed = before - len(df)

    # --- negative billing amounts are corrected, not dropped (data entry sign error) ---
    report.negative_billing_corrected = int((df["billing_amount"] < 0).sum())
    df["billing_amount"] = df["billing_amount"].abs()

    df["length_of_stay"] = (df["discharge_date"] - df["admission_date"]).dt.days

    df = df.reset_index(drop=True)
    report.rows_after = len(df)

    logger.info("Cleaning complete: %s", report.as_dict())
    return df, report


if __name__ == "__main__":
    import json

    df, report = clean("ml/data/raw/healthcare_dataset.csv")
    print(json.dumps(report.as_dict(), indent=2, default=str))
    df.to_csv("ml/data/processed/cleaned.csv", index=False)
    print(f"Wrote {len(df)} rows to ml/data/processed/cleaned.csv")
