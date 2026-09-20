"""Integration test suite for ReAdmitIQ backend and ML pipeline."""

import pytest
from fastapi.testclient import TestClient
from app.main import app


@pytest.fixture(scope="module")
def client():
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture(scope="module")
def doctor_headers(client):
    res = client.post(
        "/api/v1/auth/login",
        data={"username": "doctor@readmitiq.io", "password": "Doctor@123"},
    )
    assert res.status_code == 200, f"Login failed: {res.text}"
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture(scope="module")
def admin_headers(client):
    res = client.post(
        "/api/v1/auth/login",
        data={"username": "admin@readmitiq.io", "password": "Admin@123"},
    )
    assert res.status_code == 200, f"Admin login failed: {res.text}"
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_health_check(client):
    res = client.get("/api/v1/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "ok"
    assert data["db"] == "ok"
    assert data["model_loaded"] is True
    assert "readmitiq" in data["model_version"]


def test_model_info(client, doctor_headers):
    res = client.get("/api/v1/model/info", headers=doctor_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["stub_mode"] is False
    assert len(data["feature_order"]) == 24
    assert len(data["limitations"]) > 0


def test_auth_me(client, doctor_headers):
    res = client.get("/api/v1/auth/me", headers=doctor_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["email"] == "doctor@readmitiq.io"
    assert data["role"] == "DOCTOR"


def test_patient_list_and_detail(client, doctor_headers):
    res = client.get("/api/v1/patients", headers=doctor_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["total"] > 0
    assert len(data["items"]) > 0
    patient_id = data["items"][0]["id"]

    detail_res = client.get(f"/api/v1/patients/{patient_id}", headers=doctor_headers)
    assert detail_res.status_code == 200
    p = detail_res.json()
    assert p["id"] == patient_id
    assert "mrn" in p
    assert "full_name" in p


def test_prediction_creation_and_explanation(client, doctor_headers):
    patients_res = client.get("/api/v1/patients", headers=doctor_headers)
    patient_id = patients_res.json()["items"][0]["id"]

    pred_res = client.post(
        "/api/v1/predictions",
        json={
            "patient_id": patient_id,
            "feature_overrides": {
                "length_of_stay": 8,
                "admission_type": "Emergency",
                "test_result": "Abnormal",
            },
        },
        headers=doctor_headers,
    )
    assert pred_res.status_code == 201, f"Prediction failed: {pred_res.text}"
    pred = pred_res.json()
    assert "risk_probability" in pred
    assert pred["risk_band"] in ["LOW", "MEDIUM", "HIGH"]
    assert pred["explanation"] is not None
    assert len(pred["explanation"]["top_drivers"]) > 0
    assert len(pred["recommendations"]) > 0

    pred_id = pred["id"]
    exp_res = client.get(f"/api/v1/predictions/{pred_id}/explanation", headers=doctor_headers)
    assert exp_res.status_code == 200
    exp = exp_res.json()
    assert exp["method"] == "TreeSHAP"


def test_simulation_what_if(client, doctor_headers):
    res = client.post(
        "/api/v1/predictions/simulate",
        json={
            "age": 72,
            "prior_admission_count": 3,
            "length_of_stay": 12,
            "admission_type": "Emergency",
            "test_result": "Abnormal",
            "primary_condition": "Diabetes",
            "billing_amount": 45000.0,
            "days_since_last_discharge": 14,
            "followup_scheduled": False,
            "gender": "Male",
        },
        headers=doctor_headers,
    )
    assert res.status_code == 200
    data = res.json()
    assert "risk_probability" in data
    assert data["risk_band"] in ["LOW", "MEDIUM", "HIGH"]
    assert len(data["explanation"]["top_drivers"]) > 0


def test_analytics_overview(client, doctor_headers):
    res = client.get("/api/v1/analytics/overview", headers=doctor_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["total_patients"] > 0
    assert data["total_predictions"] > 0


def test_pdf_report_generation(client, doctor_headers):
    preds_res = client.get("/api/v1/predictions", headers=doctor_headers)
    assert preds_res.status_code == 200
    items = preds_res.json()["items"]
    assert len(items) > 0
    pred_id = items[0]["id"]

    pdf_res = client.get(f"/api/v1/reports/prediction/{pred_id}/pdf", headers=doctor_headers)
    assert pdf_res.status_code == 200
    assert pdf_res.headers["content-type"] == "application/pdf"
    assert len(pdf_res.content) > 1000


def test_audit_logs(client, admin_headers):
    res = client.get("/api/v1/audit-logs", headers=admin_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["total"] > 0
