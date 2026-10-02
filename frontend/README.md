# ReAdmitIQ — Frontend Application

> **Frontend Development Lead:** Pranali Harugire

Predictive Hospital Readmission Risk Stratification & Clinical Decision Support Interface built with **React 18**, **Vite**, **Tailwind CSS**, **Recharts**, **Framer Motion**, and **Lucide React**.

---

## 🎨 Overview & Responsibilities

The frontend application provides role-tailored clinical workstations for physicians, healthcare administrators, and patients. It seamlessly communicates with the FastAPI backend over REST APIs with real-time SHAP explainability visualizations.

### Key Lead Contributions (Pranali Harugire):
- **Physician Clinical Workstation:** Patient worklist filtering, 30-day readmission risk stratification, bedside evaluation intake form.
- **Flagship SVG Risk Gauge Component:** Animated circular probability gauge with color-coded risk bands and Brier calibration scores.
- **SHAP Waterfall Visualization:** Bar chart breakdown of patient-specific clinical drivers (biomarkers, vitals, social determinants).
- **Interactive "What-If" Counterfactual Simulator:** Stateless simulation sliders for testing post-discharge interventions and instant probability updates.
- **Patient Recovery Portal:** Empathetic risk education, 30-day recovery checklist, and care team hotline.
- **Executive Governance & Model Card:** Real-time census tracking, ROC-AUC performance curves, and HIPAA audit log views.
- **Authentication & State Management:** JWT authentication context (`AuthContext.jsx`), protected routing (`ProtectedRoute.jsx`), and automatic token refresh interceptors (`client.js`).

---

## 📁 Frontend Architecture

```
frontend/
├── public/                     # Static assets (favicon.svg)
├── src/
│   ├── api/                    # Axios REST client & API mappers
│   │   ├── client.js           # JWT token handling & refresh interceptor
│   │   └── endpoints.js        # API endpoint methods with mock fallback
│   ├── components/             # Reusable UI & Chart components
│   │   ├── charts/             # RiskGauge, SHAPWaterfall, TrendChart, AdmissionsChart
│   │   ├── shared/             # Shell, Sidebar, Topbar, RiskBadge, KPICard
│   │   └── ui/                 # Button, Card, Modal, Table, Badge, Input, Select
│   ├── contexts/               # AuthContext (Role auth) & ThemeContext (Dark/Light)
│   ├── data/                   # Initial fallback mock dataset
│   ├── lib/                    # Utility formatters (formatPercent, getRiskLevel, cn)
│   ├── pages/                  # Role-based pages
│   │   ├── admin/              # Dashboard, Analytics, ModelMonitor, Users
│   │   ├── doctor/             # Dashboard, PatientList, PatientDetail, NewAssessment, PredictionResult, Reports
│   │   ├── patient/            # Dashboard, MyRisk, CarePlan, MyHistory
│   │   ├── public/             # Landing, Login, NotFound
│   │   └── shared/             # Profile, ModelCard
│   ├── routes/                 # AppRouter & ProtectedRoute
│   ├── App.jsx                 # Application entry point & theme wrapper
│   ├── index.css               # Tailwind CSS imports & global design tokens
│   └── main.jsx                # React DOM root render
├── package.json                # Dependencies & Vite scripts
├── tailwind.config.js          # Custom colors & dark mode configuration
└── vite.config.js              # Vite server & build options
```

---

## 🚀 Setup & Execution

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
The application will launch locally at `http://localhost:5173/`.

### 3. Production Build
```bash
npm run build
```
Generates optimized static assets in `dist/`.

---

## 🔒 Environment Configuration

Create a `.env` file in the `frontend` folder:
```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_USE_MOCKS=false
```
