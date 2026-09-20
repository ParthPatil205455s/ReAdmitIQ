"""
ml/src/linkage.py

The dataset has no patient ID. This builds a deterministic
pseudo_patient_id from normalised name + gender + blood type so that
repeat episodes for the "same" patient can be chained chronologically.
This is a heuristic linkage over synthetic data, not real identity
resolution -- documented explicitly in MODEL_CARD.md.
"""
from __future__ import annotations

import hashlib

import pandas as pd


def add_pseudo_id(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    key = df["name_norm"] + "|" + df["gender"].astype(str) + "|" + df["blood_type"].astype(str)
    df["pseudo_patient_id"] = key.map(lambda s: hashlib.sha1(s.encode()).hexdigest()[:16])
    return df


def linkage_stats(df: pd.DataFrame) -> dict:
    counts = df.groupby("pseudo_patient_id").size()
    return {
        "total_episodes": int(len(df)),
        "distinct_pseudo_patients": int(counts.shape[0]),
        "repeat_patients": int((counts > 1).sum()),
        "episodes_belonging_to_repeat_patients": int(counts[counts > 1].sum()),
        "max_episodes_for_one_patient": int(counts.max()),
    }


if __name__ == "__main__":
    import json

    from clean import clean

    df, _ = clean("ml/data/raw/healthcare_dataset.csv")
    df = add_pseudo_id(df)
    print(json.dumps(linkage_stats(df), indent=2))
