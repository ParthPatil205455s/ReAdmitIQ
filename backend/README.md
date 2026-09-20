# ReAdmitIQ — Backend API

Predictive Hospital Readmission Risk Platform.
DSSA 24-Hour Hackathon 2026 · Domain 01 (MEDITECH) · PS 01.

FastAPI · PostgreSQL (Neon) · SQLAlchemy 2.0 · XGBoost + SHAP · ReportLab.

**Clinical decision support, not a medical diagnosis.** Every prediction,
report and email carries that statement.

---

## 1. Run it

```bash
cd backend
python -m venv .venv && source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# set DATABASE_URL (Neon) and SECRET_KEY:  openssl rand -hex 32

uvicorn app.main:app --reload
```

Swagger: <http://localhost:8000/docs> · Health: <http://localhost:8000/api/v1/health>

Tables are created on startup in the lifespan handler — there is no migration
step to forget before a demo.

### Seed the demo data

```bash
python -m app.db.seed
```

Idempotent: guarded by a user count, so running it twice is a no-op instead of
a wall of duplicate-key errors. Creates 3 users, 60 patients across 6 chronic
conditions with 1–4 admissions each, and one baseline prediction per patient so
the dashboard and analytics endpoints return real aggregates immediately. At
least 12 patients land in the HIGH band.

| Role | Email | Password |
|---|---|---|
| ADMIN | `admin@readmitiq.io` | `Admin@123` |
| DOCTOR | `doctor@readmitiq.io` | `Doctor@123` |
| PATIENT | `patient@readmitiq.io` | `Patient@123` |

---

## 2. Stub-first ML — the rule that saves the hackathon

The backend does **not** wait for a trained model.

`MLService.load()` tries to load `app/artifacts/model.pkl`,
`preprocessor.pkl` and `metadata.json`. If any of them is missing it logs
`stub_mode` and serves a deterministic pseudo-risk in **exactly** the frozen
response shape. Every endpoint, the PDF report and the whole frontend
integration are built and tested against that stub.

When Member 3 commits the artifacts, restart the service. `self.stub` becomes
`False`, `/health` starts reporting `model_loaded: true`, and **zero lines of
endpoint code change.** That is the entire point of building it this way.

Verify with `GET /api/v1/model/info` → `stub_mode`.

> **Version lock.** `scikit-learn`, `xgboost` and `numpy` must be pinned to the
> same versions in `ml/requirements.txt` and `backend/requirements.txt`.
> A mismatch loads fine locally and explodes in production. Currently pinned:
> `scikit-learn==1.5.2`, `xgboost==2.1.1`, `numpy==1.26.4`.

The model is warm-loaded **once** in the application lifespan, never inside a
request handler. Loading per-request costs ~4 seconds per prediction and makes
the demo look broken.

---

## 3. Architecture

Layered FastAPI. Endpoints are thin controllers that validate and delegate;
business logic lives in `app/services`; persistence is SQLAlchemy ORM only.

```
app/
├── main.py                 app factory + lifespan + middleware
├── core/                   config, security (JWT/bcrypt/rate limit), deps (RBAC), logging, exceptions
├── db/                     base, session, seed
├── models/                 8 SQLAlchemy entities
├── schemas/                Pydantic v2 DTOs
├── api/v1/                 router + 40 endpoints across 9 modules
├── services/               ml, explain, recommendation, prediction, analytics, pdf, email, audit, notification
├── templates/report.html   Jinja2 alert/report template
└── artifacts/              M3 commits model.pkl here; the backend only reads
```

### Eight tables

`users` · `patients` · `admissions` · `predictions` · `explanations` ·
`recommendations` · `notifications` · `audit_logs`

UUID primary keys, `server_default=func.now()` timestamps, cascade deletes,
JSONB for feature vectors and SHAP output. Indexes are declared on the models:
`idx_admissions_patient`, `idx_predictions_patient`, `idx_predictions_band`,
`idx_patients_condition`, `idx_notifications_user`.

---

## 4. The 40 endpoints

All under `/api/v1`.

**Auth & users (1–9)** — `POST /auth/register`, `POST /auth/login`,
`POST /auth/refresh`, `GET|PATCH /auth/me`, `POST /auth/change-password`,
`GET /users`, `PATCH /users/{id}/status`, `DELETE /users/{id}`

**Patients & admissions (10–20)** — `POST|GET /patients`,
`GET|PUT|DELETE /patients/{id}`, `GET /patients/{id}/history`,
`POST /patients/bulk-import`, `POST /patients/{id}/admissions`,
`GET|PUT|DELETE /admissions/{id}`

**Prediction & explainability (21–28)** — `POST /predictions`,
`POST /predictions/simulate`, `POST /predictions/batch`,
`GET /predictions/{id}`, `GET /predictions`,
`GET /predictions/{id}/explanation`, `GET /model/info`,
`GET /model/global-importance`

**Analytics, reports, notifications, ops (29–40)** —
`GET /analytics/overview`, `/risk-distribution`, `/by-condition`,
`/by-admission-type`, `/trend`, `/top-drivers`,
`GET /reports/prediction/{id}/pdf`, `GET /reports/patient/{id}/pdf`,
`POST /notifications/email`, `GET /notifications`,
`PATCH /notifications/{id}/read`, `GET /health`

`/health` returns exactly what Member 4 monitors:

```json
{"status":"ok","model_loaded":true,"model_version":"readmitiq-xgb-1.0.0","db":"ok"}
```

---

## 5. Explainability without an LLM

`explain_service` runs TreeSHAP over the transformed feature vector, ranks
drivers by absolute contribution, renders each one through a display template,
and composes the clinical narrative from those ranked drivers.

No generative model is involved, so the explanation **can never hallucinate a
factor the model did not actually use.** `recommendation.py` is an eight-rule
deterministic engine over the same feature vector — every recommendation is
traceable to an inspectable condition.

---

## 6. Security

- bcrypt cost 12; passwords never stored or logged in plaintext
- JWT HS256; access 30 min, refresh 7 days; `sub` = user UUID
- RBAC enforced server-side on every endpoint via the `require_role` factory —
  the frontend guard is cosmetic
- Ownership checks: a PATIENT reads only their own linked records (403 otherwise)
- All input validated by Pydantic (age 0–120, `discharge_date >= admission_date`,
  email format)
- SQLAlchemy ORM only — no f-string SQL anywhere
- CORS restricted to explicit origins, never `"*"`
- Rate limit on `POST /auth/login` (slowapi, 5/min/IP)
- PII minimisation: patient `full_name` never enters the ML feature vector
- Secrets from the environment only; `.env` is gitignored, `.env.example` committed
- `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`
- Audit row for every prediction and every mutating request
- No stack traces leak to clients:

```json
{"error":{"code":"PATIENT_NOT_FOUND","message":"No patient with that id.","request_id":"req_9a2f"}}
```

Verify before submission: `git grep -i "secret\|password\|api_key"` should
return only config references.

---

## 7. Model limitations (state these; do not let a judge find them first)

- Trained on a public Kaggle healthcare dataset that is synthetic in parts;
  absolute probabilities are not calibrated to any specific hospital population.
- No diagnosis codes, comorbidity index or medication adherence signal exists in
  the dataset, so those drivers cannot be modelled.
- Readmission is inferred from repeat admission records, not a verified 30-day
  readmission label.
- Output is decision support that supplements clinical judgement. It never
  replaces it, and it is not a diagnosis.

Served programmatically at `GET /api/v1/model/info`.

---

## 8. Definition of done

- [ ] `/docs` renders all 40 endpoints with correct schemas
- [ ] `/health` returns `model_loaded: true` on the deployed service
- [ ] All three demo logins issue valid tokens
- [ ] A PATIENT token gets 403 on `/users` and on another patient's record
- [ ] No token gets 401 everywhere
- [ ] Prediction returns under 1.5s warm, with real SHAP values
- [ ] `/predictions/simulate` returns under 500ms and persists nothing
- [ ] PDF downloads and opens correctly
- [ ] Analytics endpoints return real aggregates, not hardcoded numbers
- [ ] Seed data present in the production database
- [ ] Repo grep for secrets is clean
- [ ] Audit log populated after a demo run
