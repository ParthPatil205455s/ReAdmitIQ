"""
ml/src/preprocessing.py

ColumnTransformer + StratifiedGroupKFold. Fit inside each CV fold only
(never on the full dataset) -- see train.py.
"""
from __future__ import annotations

from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.model_selection import StratifiedGroupKFold
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

from features import BINARY_FEATURES, CATEGORICAL_FEATURES, NUMERIC_FEATURES


def build_preprocessor() -> ColumnTransformer:
    return ColumnTransformer(
        transformers=[
            (
                "num",
                Pipeline([
                    ("imp", SimpleImputer(strategy="median")),
                    ("sc", StandardScaler()),
                ]),
                NUMERIC_FEATURES,
            ),
            (
                "cat",
                Pipeline([
                    ("imp", SimpleImputer(strategy="most_frequent")),
                    ("oh", OneHotEncoder(handle_unknown="ignore", sparse_output=False)),
                ]),
                CATEGORICAL_FEATURES,
            ),
            ("bin", "passthrough", BINARY_FEATURES),
        ],
        remainder="drop",
    )


def build_cv(n_splits: int = 5, random_state: int = 42) -> StratifiedGroupKFold:
    return StratifiedGroupKFold(n_splits=n_splits, shuffle=True, random_state=random_state)


def get_output_feature_names(preprocessor: ColumnTransformer) -> list[str]:
    """Call AFTER preprocessor.fit(); returns flat post-transform feature names
    (needed for SHAP plots to label bars with real feature names, not x0, x1...)."""
    names: list[str] = []
    num_names = NUMERIC_FEATURES
    cat_encoder = preprocessor.named_transformers_["cat"].named_steps["oh"]
    cat_names = list(cat_encoder.get_feature_names_out(CATEGORICAL_FEATURES))
    names.extend(num_names)
    names.extend(cat_names)
    names.extend(BINARY_FEATURES)
    return names
