# ReAdmitIQ — ML Pipeline (Member 3 scope)

## Setup
```bash
cd ml
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
```

## Run everything
```bash
python run_pipeline.py
```
This cleans the raw CSV, links patients, engineers the label, builds the 24
features, compares 5 models with grouped CV, calibrates the winner, tunes the
threshold, runs SHAP (if installed), exports `model.pkl` / `preprocessor.pkl`
(bundled inside the calibrated pipeline) / `metadata.json` /
`feature_schema.json` to `../backend/app/artifacts/`, and writes evaluation
figures to `reports/figures/`.

**Important:** this was authored in a sandbox with no internet access, so
XGBoost, LightGBM, SHAP and LIME could not be installed there. The code
handles their absence gracefully (falls back to the 3 sklearn-native models
and logs a warning) — but for your real submission, install the full
`requirements.txt` and re-run. Nothing needs editing; the same script picks
up all 5 models and SHAP automatically once the packages are present.

## Verify before you commit
```bash
python -m pytest tests/ -v          # 7 tests: cleaning, linkage, labeling,
                                      # leakage controls, feature integrity
pip freeze | grep -E "scikit-learn|xgboost|numpy"   # must match backend/requirements.txt
ls -la ../backend/app/artifacts/model.pkl            # must be < 100MB for git push
```

## Read first
- `MODEL_CARD.md` — the full story: why the window is 365 days not 30, real
  metrics, disclosed leakage caveat, limitations. Read this before the demo —
  it has your answers to the hardest judge questions already written out.
- `src/features.py` — docstring lists the 3 leakage controls verbatim.

## Files
```
ml/
├── requirements.txt
├── run_pipeline.py          # orchestrator — run this
├── MODEL_CARD.md
├── notebooks/01_eda.ipynb
├── src/
│   ├── clean.py             # cleaning + CleaningReport
│   ├── linkage.py           # pseudo_patient_id
│   ├── labeling.py          # readmission label + window decision
│   ├── features.py          # 24 leakage-safe features
│   ├── preprocessing.py     # ColumnTransformer + StratifiedGroupKFold
│   ├── train.py             # 5-model comparison
│   ├── calibrate.py         # isotonic calibration + threshold tuning
│   ├── explain.py           # SHAP + LIME + JSON driver contract
│   └── export.py            # artifact export + round-trip test
├── tests/test_pipeline.py   # 7 tests, all passing
├── data/{raw,processed}/
└── reports/{figures/, *.csv, *.json}
```
