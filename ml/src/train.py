"""
ml/src/train.py

Trains and compares 5 classifiers with StratifiedGroupKFold (grouped by
pseudo_patient_id, so no patient leaks across train/test). The
preprocessor is fit fresh inside each fold via the sklearn Pipeline --
never on the full dataset.

Why PR-AUC, not accuracy: with ~1% positives here, a model that predicts
"no readmission" for everyone scores ~99% accuracy and is clinically
worthless. Selection uses mean PR-AUC across folds; ties broken on
recall at the tuned threshold, then on fit time.

NOTE: xgboost and lightgbm are optional imports. If they aren't
installed in the current environment, this script still runs the
sklearn-native models (LogisticRegression, RandomForest,
GradientBoosting) and logs a warning -- it does NOT silently skip them
on a machine where they ARE installed (e.g. after
`pip install -r requirements.txt`), so run this for real before your
final submission.
"""
from __future__ import annotations

import logging
import sys

import pandas as pd
from sklearn.ensemble import GradientBoostingClassifier, RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import cross_validate
from sklearn.pipeline import Pipeline

sys.path.insert(0, "src")
from features import ALL_FEATURES  # noqa: E402
from preprocessing import build_cv, build_preprocessor  # noqa: E402

logger = logging.getLogger(__name__)

SCORING = ["roc_auc", "average_precision", "precision", "recall", "f1"]


def build_models(y) -> dict:
    spw = (y == 0).sum() / max((y == 1).sum(), 1)

    models = {
        "LogisticRegression": LogisticRegression(max_iter=2000, class_weight="balanced"),
        "RandomForest": RandomForestClassifier(
            n_estimators=300, min_samples_leaf=5, class_weight="balanced",
            n_jobs=-1, random_state=42,
        ),
        "GradientBoosting": GradientBoostingClassifier(random_state=42),
    }

    try:
        from xgboost import XGBClassifier

        models["XGBoost"] = XGBClassifier(
            n_estimators=400, max_depth=5, learning_rate=0.06,
            subsample=0.85, colsample_bytree=0.85, scale_pos_weight=spw,
            eval_metric="aucpr", tree_method="hist", random_state=42,
        )
    except ImportError:
        logger.warning("xgboost not installed in this environment -- skipping. "
                        "Run `pip install -r requirements.txt` before final submission.")

    try:
        from lightgbm import LGBMClassifier

        models["LightGBM"] = LGBMClassifier(
            n_estimators=400, num_leaves=31, learning_rate=0.06,
            class_weight="balanced", random_state=42, verbose=-1,
        )
    except ImportError:
        logger.warning("lightgbm not installed in this environment -- skipping. "
                        "Run `pip install -r requirements.txt` before final submission.")

    return models


def compare_models(X: pd.DataFrame, y: pd.Series, groups: pd.Series) -> pd.DataFrame:
    pre = build_preprocessor()
    cv = build_cv()
    models = build_models(y)

    rows = []
    for name, clf in models.items():
        pipe = Pipeline([("pre", pre), ("clf", clf)])
        print(f"  Cross-validating {name} ...", flush=True)
        cvres = cross_validate(pipe, X, y, cv=cv, groups=groups, scoring=SCORING, n_jobs=-1)
        rows.append({
            "model": name,
            **{
                s: f"{cvres['test_' + s].mean():.4f} ± {cvres['test_' + s].std():.4f}"
                for s in SCORING
            },
            "mean_pr_auc": cvres["test_average_precision"].mean(),
            "mean_recall": cvres["test_recall"].mean(),
            "mean_fit_time": cvres["fit_time"].mean(),
        })

    comparison = pd.DataFrame(rows).sort_values(
        ["mean_pr_auc", "mean_recall", "mean_fit_time"],
        ascending=[False, False, True],
    )
    return comparison


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(message)s")

    window = 365
    label_col = f"readmitted_{window}d"

    df = pd.read_csv("data/processed/features.csv")
    X = df[ALL_FEATURES]
    y = df[label_col]
    groups = df["pseudo_patient_id"]

    print(f"X: {X.shape}, positive rate: {y.mean():.4%}, groups: {groups.nunique()}")

    comparison = compare_models(X, y, groups)
    print()
    print(comparison.drop(columns=["mean_pr_auc", "mean_recall", "mean_fit_time"]).to_string(index=False))

    comparison.to_csv("reports/model_comparison.csv", index=False)
    print("\nWrote reports/model_comparison.csv")
