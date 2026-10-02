# ReAdmitIQ — System Integration & DevOps

> **Integration & DevOps Lead:** Harshita Shroff

Comprehensive documentation of end-to-end service orchestration, API integration contracts, environment configuration, containerization, and automated integration testing for **ReAdmitIQ**.

---

## ⚡ Overview & Responsibilities

The Integration & DevOps layer binds the React frontend, FastAPI backend, and scikit-learn/SHAP machine learning pipeline into a unified, high-reliability clinical decision support system.

### Key Lead Contributions (Harshita Shroff):
- **End-to-End System Integration:** Wired REST communication between Frontend (Axios) and Backend (FastAPI) across 41 versioned endpoints.
- **Backend ↔ ML Pipeline Integration:** Warm-loaded RandomForest classifier (`model.pkl`) and TreeSHAP explainability engine into application lifespan with sub-50ms inference latency.
- **One-Click Launch Automation:** Engineered `start.bat` for dual-process concurrent launch of backend Uvicorn server and Vite frontend.
- **Containerization & Deployment:** Built `Dockerfile` for backend containerization and environment template (`.env.example`).
- **Security & Rate Limiting:** Configured CORS origins, JWT authentication flows, and API rate-limiting (`slowapi`).
- **Integration Test Suite:** Maintained `backend/tests/test_integration.py` ensuring 100% pass rate across health checks, auth, predictions, and reports.

---

## 🔄 End-to-End Data & Integration Flow

```
+-------------------+        HTTP REST / JWT        +-------------------+
|  React 18 Frontend|  <=========================>  |  FastAPI Backend  |
|  (Port 5173)      |                               |  (Port 8000)      |
+-------------------+                               +---------+---------+
                                                              |
                                                    Warm-Loaded In-Memory
                                                              |
                                                              v
+-------------------+        SHAP Feature Driver    +-------------------+
| PDF Discharge     |  <--------------------------  | Calibrated ML     |
| Binders           |                               | Model & TreeSHAP  |
+-------------------+                               +-------------------+
```

1. **Patient Data Intake:** Provider inputs clinical parameters via Frontend form.
2. **API Dispatch:** React dispatches authenticated `POST /api/v1/predictions` request with JWT bearer token.
3. **Model Inference:** Backend passes features to ColumnTransformer preprocessor and calibrated RandomForest model (~40ms).
4. **Explainability & Rules:** `explain_service` executes TreeSHAP for feature attributions; `recommendation_service` applies clinical rules.
5. **Persistence & Response:** Prediction result, SHAP drivers, and care plan are stored in SQLite/Postgres DB and returned to Frontend.
6. **PDF Generation:** On demand, ReportLab renders downloadable clinical discharge audit binder.

---

## 🚀 One-Command Local Startup

To run both backend and frontend services simultaneously:

### Windows (Batch Script)
```cmd
.\start.bat
```

### Manual Concurrent Start
```bash
# Terminal 1: Backend
cd backend
python -m uvicorn app.main:app --reload --port 8000

# Terminal 2: Frontend
cd frontend
npm run dev
```

---

## 🧪 Integration Testing Suite

Verify full system integration locally:

```bash
cd backend
python -m pytest tests/test_integration.py -v
```

### Verified Scenarios (9/9 Passed):
- `test_health_check`: Backend operational and ML model warm-loaded.
- `test_login_success`: OAuth2 password authentication & JWT token generation.
- `test_login_invalid`: Failed login rejection.
- `test_patient_creation`: Patient record intake and database persistence.
- `test_predict`: End-to-end ML model inference and probability output.
- `test_explain`: TreeSHAP waterfall driver generation.
- `test_pdf_report_generation`: Server-side PDF generation.
- `test_analytics_by_condition`: Analytics aggregation by condition.
- `test_unauthorized_access`: Role-Based Access Control (RBAC) enforcement.

---

## 📁 Integration Directory Structure

```
integration/
├── README.md                   # Integration & DevOps architecture documentation
└── docs/                       # Operational integration guides
```
