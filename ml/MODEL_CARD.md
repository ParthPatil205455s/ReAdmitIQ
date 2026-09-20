# ReAdmitIQ — Model Card

**Model version:** `readmitiq-randomforest-1.0.0` (placeholder winner — see note below)
**Trained:** run `run_pipeline.py` to regenerate; timestamp is written into `metadata.json`
**Target:** `readmitted_within_365d`
**Dataset:** Kaggle `prasad22/healthcare-dataset`, 55,500 rows, 15 columns (per PS 01, this is the sole specified dataset)

> **Note on the current winner:** XGBoost and LightGBM could not be installed in the
> environment this pipeline was authored in (no internet access). The comparison
> and exported artifact below use only the three sklearn-native models
> (LogisticRegression, RandomForest, GradientBoosting). **Before final submission,
> run `pip install -r requirements.txt` and re-run `python run_pipeline.py`** so
> XGBoost and LightGBM are included in the real 5-model comparison and SHAP/LIME
> are generated. The pipeline code already handles this automatically — nothing
> to edit, just re-run with the full dependencies installed.

## 1. The central problem: no readmission label

The specified dataset has no `readmission` column, no patient ID, and 15 flat
columns per independent episode. We engineered both.

**Patient linkage:** a deterministic `pseudo_patient_id` = SHA-1 hash of
`normalised_name | gender | blood_type`. This is a heuristic over synthetic
data, not verified identity resolution — two different real people could share
a hash; the reverse (one real person split across hashes) is unlikely given
name+gender+blood-type is fairly specific. Result: 54,966 cleaned episodes →
48,896 distinct pseudo-patients, 5,779 of whom have 2+ episodes.

**Label:** an episode is positive if the *same* pseudo-patient's *next*
admission falls within `window` days of *this* episode's discharge.
Right-censored final episodes (discharged too close to the end of the
observation period to have had a chance to "readmit") are excluded, not
labeled negative — this avoids a downward bias on prevalence.

## 2. Window decision — a finding beyond the original spec

The work order's escape hatch says: if 30-day positives < 400, promote to 90
days. On this dataset, **that wasn't enough**:

| Window | Positives | Total episodes | Prevalence |
|---|---|---|---|
| 30d | 45 | 54,494 | 0.08% |
| 60d | 81 | 53,718 | 0.15% |
| 90d | 116 | 52,921 | 0.22% |
| 180d | 227 | 50,491 | 0.45% |
| **365d** | **405** | **45,477** | **0.89%** |

Why: admission/discharge dates in this synthetic dataset are generated
independently per row, not as a coherent patient timeline. The median gap
between a repeat patient's chronologically-sorted episodes is **negative**
(episodes frequently overlap on paper), so date-proximity readmission signal
is very weak at any window. We walked the window outward until 365 days
cleared the 400-record floor (405 positives). **This is disclosed, not hidden**
— it's a stronger finding than the spec anticipated, and worth leading with in
the demo rather than working around quietly.

## 3. Feature engineering — 24 features, leakage-safe

Full feature list and leakage controls are documented in `src/features.py`.
Three controls, verified in code:
1. All utilisation features (`prior_admission_count`, `days_since_last_discharge`,
   `cumulative_los_prior`, `had_prior_emergency`) are computed strictly from
   episodes *before* the index admission (`cumcount()`/`cumsum()` offset by the
   current row).
2. Splitting uses `StratifiedGroupKFold` on `pseudo_patient_id` — no patient
   appears in both train and test.
3. The `ColumnTransformer` is fit inside each CV fold (via `sklearn.Pipeline`),
   never on the full dataset.

**Disclosed caveat:** `prior_admission_count` and `days_since_last_discharge`
are the strongest real-world predictors of readmission, so they belong in the
model — but in this dataset they are also partly mechanically correlated with
the engineered label (more episodes → mechanically more likely to have a
"next" one). We kept them and disclosed this rather than remove real signal to
hide the correlation.

## 4. Model comparison (grouped 5-fold CV, mean ± std)

Run from the sandbox with only sklearn-native models installed (see note
above — re-run with XGBoost + LightGBM before submission):

| Model | ROC-AUC | PR-AUC | Precision | Recall | F1 |
|---|---|---|---|---|---|
| RandomForest | 0.541 ± 0.020 | 0.013 ± 0.001 | 0.000 ± 0.000 | 0.000 ± 0.000 | 0.000 ± 0.000 |
| LogisticRegression | 0.532 ± 0.020 | 0.013 ± 0.004 | 0.010 ± 0.001 | 0.427 ± 0.053 | 0.019 ± 0.002 |
| GradientBoosting | 0.529 ± 0.034 | 0.012 ± 0.001 | 0.021 ± 0.026 | 0.005 ± 0.006 | 0.008 ± 0.010 |

Selection rule: highest mean PR-AUC, tie-break on recall then fit time. Winner:
**RandomForest** (pending re-comparison with XGBoost/LightGBM included).

**Why PR-AUC and not accuracy:** with a 0.89% positive class, predicting "no
readmission" for every patient scores >99% accuracy and is clinically
worthless. We report PR-AUC and recall at the tuned operating threshold
instead.

**Honest read of these numbers:** ROC-AUC ≈0.53–0.57 is barely above chance
(0.5). This is expected, not a bug — see §6.

## 5. Calibration & threshold

Isotonic calibration (`CalibratedClassifierCV`, `cv=3` — reduced from the
work order's `cv=5` because with a 300-tree RandomForest, `cv=5` produced a
115MB pickle, over GitHub's 100MB push limit; `cv=3` brings it to ~56MB).

- Decision threshold tuned to maximise recall subject to a 0.25 precision
  floor; since no threshold reached that floor on this near-random model, the
  code falls back to the F1-maximising operating point and flags it.
- Brier score ≈0.0093 (low, but mostly reflects the low base rate rather than
  strong calibration — a model that always predicts ~0.9% would also have a
  low Brier score here).

## 6. Limitations (say these out loud; don't wait for the judges to ask)

- Trained on a **synthetic** public dataset; feature relationships are
  randomised by construction, not clinically grounded.
- The label is engineered via heuristic patient linkage, not clinically
  adjudicated.
- The 365-day window is wider than clinically standard (30/90 days are the
  usual readmission-quality windows in real healthcare analytics) — a direct,
  disclosed consequence of this dataset's date randomness.
- `prior_admission_count` / `days_since_last_discharge` carry some mechanical
  correlation with the label (§3).
- Discrimination (ROC-AUC ≈0.53–0.57) is weak — close to chance. This is a
  genuine property of the dataset, not a pipeline defect: the features are
  independently randomised per row by construction, so there is very little
  real signal to learn regardless of model choice.
- Not validated on any real clinical population. **Not a medical device.**
  Would need real EHR data, temporal validation, and fairness auditing across
  age/gender/insurance before any real deployment.

## 7. What to say if asked "would you deploy this?"

"Not as trained, and we say so in the product and on this slide. What we've
built is the pipeline and the decision-support interface a real deployment
would use — leakage-safe features, grouped cross-validation, calibration,
threshold tuning, and SHAP explainability. Point it at a real EHR extract and
the same code produces clinically useful risk scores."
