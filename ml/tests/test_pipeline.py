"""
ml/tests/test_pipeline.py

Run with: cd ml && python -m pytest tests/ -v
Uses a small synthetic sample so tests run in <1s and don't require the
full 55,500-row dataset on disk.
"""
import sys
from pathlib import Path

import pandas as pd
import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from clean import clean, RENAME  # noqa: E402
from linkage import add_pseudo_id, linkage_stats  # noqa: E402
from labeling import label, prevalence_table, choose_window  # noqa: E402
from features import build_features, ALL_FEATURES  # noqa: E402


@pytest.fixture
def raw_csv(tmp_path):
    """A tiny synthetic CSV shaped like the real dataset, with one
    deliberate duplicate row, one negative billing amount, and one
    patient who is readmitted within 10 days (to exercise labeling)."""
    rows = [
        # name, age, gender, blood, condition, admit, doctor, hospital, insurer, billing, room, adm_type, discharge, med, test
        ["Alice Smith", 45, "Female", "A+", "Diabetes", "2023-01-01", "Dr A", "Hosp A", "Aetna", 1000.0, 101, "Emergency", "2023-01-05", "Aspirin", "Normal"],
        ["Alice Smith", 45, "Female", "A+", "Diabetes", "2023-01-10", "Dr A", "Hosp A", "Aetna", 1200.0, 102, "Urgent", "2023-01-12", "Aspirin", "Abnormal"],
        ["Bob Jones", 60, "Male", "B-", "Cancer", "2022-05-01", "Dr B", "Hosp B", "Cigna", -500.0, 200, "Elective", "2022-05-10", "Ibuprofen", "Inconclusive"],
        ["Bob Jones", 60, "Male", "B-", "Cancer", "2022-05-01", "Dr B", "Hosp B", "Cigna", -500.0, 200, "Elective", "2022-05-10", "Ibuprofen", "Inconclusive"],  # exact dup
        ["Carla Diaz", 30, "Female", "O+", "Asthma", "2023-06-01", "Dr C", "Hosp C", "Medicare", 800.0, 150, "Emergency", "2023-06-03", "Penicillin", "Normal"],
    ]
    cols = list(RENAME.keys())
    df = pd.DataFrame(rows, columns=cols)
    path = tmp_path / "raw.csv"
    df.to_csv(path, index=False)
    return str(path)


def test_clean_removes_duplicate_and_fixes_negative_billing(raw_csv):
    df, report = clean(raw_csv)
    assert report.duplicates_removed == 1
    assert report.negative_billing_corrected == 1
    assert (df["billing_amount"] >= 0).all()
    assert "length_of_stay" in df.columns
    assert (df["length_of_stay"] >= 0).all()


def test_linkage_groups_same_patient(raw_csv):
    df, _ = clean(raw_csv)
    df = add_pseudo_id(df)
    stats = linkage_stats(df)
    # Alice Smith appears twice -> exactly one repeat patient
    assert stats["repeat_patients"] == 1
    assert stats["distinct_pseudo_patients"] == 3  # Alice, Bob(dedup'd), Carla


def test_label_flags_readmission_within_window(raw_csv):
    df, _ = clean(raw_csv)
    df = add_pseudo_id(df)
    labeled = label(df, window=30)
    alice = labeled[labeled["name"] == "Alice Smith"].sort_values("admission_date")
    # first Alice episode discharged 2023-01-05, next admission 2023-01-10 -> 5 days -> positive
    assert alice.iloc[0]["readmitted_30d"] == 1


def test_no_patient_leakage_across_groups(raw_csv):
    df, _ = clean(raw_csv)
    df = add_pseudo_id(df)
    labeled = label(df, window=30)
    feats = build_features(labeled)
    # every pseudo_patient_id must map to exactly one set of static attrs (gender/blood_type)
    g = feats.groupby("pseudo_patient_id")["gender"].nunique()
    assert (g == 1).all()


def test_feature_matrix_has_no_nulls_and_24_features(raw_csv):
    df, _ = clean(raw_csv)
    df = add_pseudo_id(df)
    labeled = label(df, window=30)
    feats = build_features(labeled)
    assert len(ALL_FEATURES) == 24
    assert feats[ALL_FEATURES].isna().sum().sum() == 0


def test_utilisation_features_are_strictly_prior(raw_csv):
    """Leakage check: the FIRST episode for any patient must show zero
    prior admissions and zero cumulative prior length of stay."""
    df, _ = clean(raw_csv)
    df = add_pseudo_id(df)
    labeled = label(df, window=30)
    feats = build_features(labeled).sort_values(["pseudo_patient_id", "admission_date"])
    first_episodes = feats.groupby("pseudo_patient_id").head(1)
    assert (first_episodes["prior_admission_count"] == 0).all()
    assert (first_episodes["cumulative_los_prior"] == 0).all()


def test_choose_window_promotes_when_floor_not_met():
    prev = pd.DataFrame({
        "window_days": [30, 60, 90, 180, 365],
        "positives": [10, 20, 30, 50, 450],
        "total_episodes": [1000] * 5,
        "prevalence_pct": [1.0, 2.0, 3.0, 5.0, 45.0],
    })
    window, reason = choose_window(prev, min_positives=400)
    assert window == 365
    assert "365" in reason
