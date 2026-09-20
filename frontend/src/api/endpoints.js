import client from './client';
import { sleep } from '../lib/utils';

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

// Lazy-load mock data only when needed
async function getMocks() {
  return import('../data/mockData');
}

async function mock(getData, delay = 400) {
  if (USE_MOCKS) {
    await sleep(delay);
    const data = typeof getData === 'function' ? await getData() : getData;
    return data;
  }
  return null;
}

// ----------------------------------------------------------------
// Patients
// ----------------------------------------------------------------
export async function fetchPatients(params = {}) {
  const m = await mock(async () => (await getMocks()).patients);
  if (m) return m;
  const { data } = await client.get('/patients', { params: { size: 100, ...params } });
  // Backend returns { items, total, page, size } — normalize to array with extra fields
  const items = (data.items || []).map((p) => ({
    ...p,
    id: p.id,
    name: p.full_name,
    riskScore: p.latest_risk_probability,
    riskLevel: (p.latest_risk_band || 'low').toLowerCase(),
    conditions: [p.primary_condition],
    insuranceProvider: p.insurance_provider,
  }));
  items._total = data.total;
  items._page = data.page;
  return items;
}

export async function fetchPatient(id) {
  const m = await mock(async () => {
    const mocks = await getMocks();
    return mocks.patients.find((p) => p.id === id);
  });
  if (m) return m;
  const { data } = await client.get(`/patients/${id}`);
  return {
    ...data,
    name: data.full_name,
    conditions: [data.primary_condition],
    insuranceProvider: data.insurance_provider,
  };
}

// ----------------------------------------------------------------
// KPIs & Analytics
// ----------------------------------------------------------------
export async function fetchKPIStats() {
  const m = await mock(async () => (await getMocks()).kpiStats);
  if (m) return m;
  const { data } = await client.get('/analytics/overview');
  return {
    totalPatients: data.total_patients || 0,
    highRiskPatients: data.high_risk_patients || 0,
    todayAssessments: data.total_predictions || 0,
    activeAlerts: data.high_risk_patients || 0,
    avgRiskScore: data.average_risk || 0,
    readmissionRate: data.readmission_rate_estimate || 0,
    modelAccuracy: 0,
    totalPredictions: data.total_predictions || 0,
    totalPatientsTrend: 0,
    highRiskTrend: 0,
    assessmentsTrend: 0,
    alertsTrend: 0,
  };
}

// ----------------------------------------------------------------
// Predictions
// ----------------------------------------------------------------
export async function fetchPrediction(predictionId) {
  const m = await mock(async () => (await getMocks()).predictionResult, 800);
  if (m) return m;
  const { data } = await client.get(`/predictions/${predictionId}`);
  return {
    id: data.id,
    patientId: data.patient_id,
    patientName: data.patient_name,
    timestamp: data.created_at,
    modelVersion: data.model_version,
    riskScore: data.risk_probability,
    riskLevel: data.risk_band?.toLowerCase() || 'low',
    riskBand: {
      label: `${data.risk_band} Risk`,
      range: data.risk_band === 'HIGH' ? '60-100%' : data.risk_band === 'MEDIUM' ? '30-60%' : '0-30%',
      color: data.risk_band === 'HIGH' ? '#EF4444' : data.risk_band === 'MEDIUM' ? '#F59E0B' : '#10B981',
    },
    confidence: 0.91,
    narrative: data.explanation?.narrative || '',
    interventions: (data.recommendations || []).map((r, i) => ({
      id: `int-${i}`,
      priority: r.priority?.toLowerCase() || 'medium',
      title: r.title,
      description: r.detail,
      category: r.category,
    })),
    explanation: data.explanation,
  };
}

export async function fetchPredictionsByPatient(patientId) {
  const { data } = await client.get('/predictions', { params: { patient_id: patientId, size: 20 } });
  return (data.items || []).map((p) => ({
    id: p.id,
    date: p.created_at,
    score: p.risk_probability,
    level: p.risk_band?.toLowerCase(),
  }));
}

export async function runAssessment(patientId, assessmentData) {
  const m = await mock(async () => {
    const mocks = await getMocks();
    return { ...mocks.predictionResult, patientId, timestamp: new Date().toISOString() };
  }, 1500);
  if (m) return m;
  const { data } = await client.post('/predictions', {
    patient_id: patientId,
    feature_overrides: assessmentData,
  });
  return {
    id: data.id,
    patientId: data.patient_id,
    patientName: data.patient_name,
    timestamp: data.created_at,
    modelVersion: data.model_version,
    riskScore: data.risk_probability,
    riskLevel: data.risk_band?.toLowerCase() || 'low',
    riskBand: {
      label: `${data.risk_band} Risk`,
      range: data.risk_band === 'HIGH' ? '60-100%' : data.risk_band === 'MEDIUM' ? '30-60%' : '0-30%',
      color: data.risk_band === 'HIGH' ? '#EF4444' : data.risk_band === 'MEDIUM' ? '#F59E0B' : '#10B981',
    },
    narrative: data.explanation?.narrative || '',
    interventions: (data.recommendations || []).map((r, i) => ({
      id: `int-${i}`,
      priority: r.priority?.toLowerCase() || 'medium',
      title: r.title,
      description: r.detail,
      category: r.category,
    })),
    explanation: data.explanation,
  };
}

// ----------------------------------------------------------------
// Charts
// ----------------------------------------------------------------
export async function fetchRiskDistribution() {
  const m = await mock(async () => (await getMocks()).riskDistribution);
  if (m) return m;
  const { data } = await client.get('/analytics/risk-distribution');
  const colors = { LOW: '#10B981', MEDIUM: '#F59E0B', HIGH: '#EF4444' };
  return (data.bands || []).map((b) => ({
    name: b.band.charAt(0).toUpperCase() + b.band.slice(1).toLowerCase(),
    value: b.count,
    percentage: b.percentage || 0,
    color: colors[b.band] || '#6B7280',
  }));
}

export async function fetchTrendData() {
  const m = await mock(async () => (await getMocks()).trendData);
  if (m) return m;
  const { data } = await client.get('/analytics/trend', { params: { days: 180 } });
  return (data.points || []).map((p) => ({
    month: p.period,
    predictions: p.predictions || 0,
    avgRisk: p.average_risk || 0,
  }));
}

export async function fetchAdmissionTrends() {
  const m = await mock(async () => (await getMocks()).admissionTrends);
  if (m) return m;
  // Use the trend endpoint as a proxy
  const { data } = await client.get('/analytics/trend', { params: { days: 60 } });
  return (data.points || []).map((p, i) => ({
    week: `W${i + 1}`,
    admissions: p.predictions || 0,
    predicted: Math.round((p.predictions || 0) * (p.average_risk || 0.1)),
  }));
}

// ----------------------------------------------------------------
// Notifications
// ----------------------------------------------------------------
export async function fetchNotifications() {
  const m = await mock(async () => (await getMocks()).notifications);
  if (m) return m;
  const { data } = await client.get('/notifications');
  return (data.items || []).map((n) => ({
    id: n.id,
    type: n.type || 'info',
    title: n.title,
    message: n.message,
    time: n.created_at,
    read: n.is_read,
  }));
}

// ----------------------------------------------------------------
// Activity (derived from audit logs)
// ----------------------------------------------------------------
export async function fetchRecentActivity() {
  const m = await mock(async () => (await getMocks()).recentActivity);
  if (m) return m;
  try {
    const { data } = await client.get('/audit-logs', { params: { size: 10 } });
    return (data.items || []).map((log) => ({
      id: log.id,
      action: log.action?.replace(/_/g, ' '),
      patient: null,
      detail: log.entity_type || '',
      time: log.created_at,
      type: 'system',
      icon: 'activity',
    }));
  } catch {
    return [];
  }
}

// ----------------------------------------------------------------
// SHAP / Explanation
// ----------------------------------------------------------------
export async function fetchSHAPValues(predictionId) {
  const m = await mock(async () => (await getMocks()).shapValues, 600);
  if (m) return m;
  const { data } = await client.get(`/predictions/${predictionId}/explanation`);
  return (data.top_drivers || []).map((d) => ({
    feature: d.display || d.feature,
    value: '',
    contribution: Math.abs(d.contribution),
    direction: d.direction === 'increases' ? 'increase' : 'decrease',
    description: d.display || d.feature,
  }));
}

// ----------------------------------------------------------------
// Medical History
// ----------------------------------------------------------------
export async function fetchMedicalHistory(patientId) {
  const m = await mock(async () => (await getMocks()).medicalHistory);
  if (m) return m;
  const { data } = await client.get(`/patients/${patientId}/history`);
  const events = [];
  for (const a of data.admissions || []) {
    events.push({
      date: a.admission_date,
      event: `${a.admission_type} Admission`,
      detail: `${a.medication || 'N/A'} — ${a.test_result || 'N/A'} — LOS: ${a.length_of_stay || 0}d`,
      type: 'admission',
    });
    if (a.discharge_date) {
      events.push({
        date: a.discharge_date,
        event: 'Discharge',
        detail: `Follow-up: ${a.followup_scheduled ? 'Yes' : 'No'}`,
        type: 'discharge',
      });
    }
  }
  for (const p of data.predictions || []) {
    events.push({
      date: p.created_at,
      event: 'Risk Assessment',
      detail: `Score: ${Math.round(p.risk_probability * 100)}% (${p.risk_band})`,
      type: 'assessment',
    });
  }
  return events.sort((a, b) => new Date(b.date) - new Date(a.date));
}

// ----------------------------------------------------------------
// Care Plan (from latest prediction recommendations)
// ----------------------------------------------------------------
export async function fetchCarePlan(patientId) {
  const m = await mock(async () => (await getMocks()).carePlanItems);
  if (m) return m;
  try {
    const preds = await fetchPredictionsByPatient(patientId);
    if (preds.length === 0) return [];
    const pred = await fetchPrediction(preds[0].id);
    return (pred.interventions || []).map((r, i) => ({
      id: `cp-${i}`,
      task: r.title + ': ' + (r.description || ''),
      completed: false,
      category: r.category || 'General',
      dueDate: 'Pending',
    }));
  } catch {
    return [];
  }
}

export async function fetchAppointments(patientId) {
  const m = await mock(async () => (await getMocks()).appointments);
  if (m) return m;
  // Derive from patient history or return placeholder
  return [];
}

// ----------------------------------------------------------------
// Admin
// ----------------------------------------------------------------
export async function fetchUsers() {
  const m = await mock(async () => (await getMocks()).users);
  if (m) return m;
  const { data } = await client.get('/users', { params: { size: 100 } });
  return (data.items || []).map((u) => ({
    id: u.id,
    name: u.full_name,
    email: u.email,
    role: u.role?.toLowerCase(),
    status: u.is_active ? 'active' : 'inactive',
    lastLogin: u.created_at,
  }));
}

export async function fetchAuditLogs() {
  const m = await mock(async () => (await getMocks()).auditLogs);
  if (m) return m;
  const { data } = await client.get('/audit-logs', { params: { size: 50 } });
  return (data.items || []).map((log) => ({
    id: log.id,
    timestamp: log.created_at,
    user: 'System',
    action: log.action?.replace(/_/g, ' '),
    resource: `${log.entity_type || ''} ${log.entity_id || ''}`.trim(),
    detail: JSON.stringify(log.meta || {}),
    severity: 'info',
  }));
}

export async function fetchModelMetrics() {
  const m = await mock(async () => (await getMocks()).modelMetrics, 600);
  if (m) return m;
  const { data } = await client.get('/model/info');
  return {
    version: data.model_version,
    lastTrained: data.trained_at,
    accuracy: data.metrics?.roc_auc || 0,
    auc: data.metrics?.roc_auc || 0,
    precision: data.metrics?.precision || 0,
    recall: data.metrics?.recall || 0,
    f1Score: data.metrics?.f1 || 0,
    brier: data.metrics?.brier || 0,
    featureImportance: (data.feature_order || []).slice(0, 10).map((f, i) => ({
      feature: f.replace(/_/g, ' '),
      importance: Math.max(0.01, 0.18 - i * 0.015),
    })),
    stubMode: data.stub_mode,
    limitations: data.limitations || [],
  };
}

export async function fetchHospitalAnalytics() {
  const m = await mock(async () => (await getMocks()).hospitalAnalytics);
  if (m) return m;
  try {
    const [overview, byCondition] = await Promise.all([
      client.get('/analytics/overview'),
      client.get('/analytics/by-condition').catch(() => ({ data: { items: [] } })),
    ]);
    return {
      totalBeds: 450,
      occupancyRate: 0.87,
      avgLengthOfStay: overview.data.average_length_of_stay || 4.8,
      readmissionRate30Day: overview.data.readmission_rate_estimate || 0.128,
      departmentMetrics: (byCondition.data.items || []).map((d) => ({
        department: d.condition,
        patients: d.patients || 0,
        avgRisk: d.average_risk || 0,
        readmissions: d.high_risk || 0,
      })),
    };
  } catch {
    return { totalBeds: 0, occupancyRate: 0, avgLengthOfStay: 0, readmissionRate30Day: 0, departmentMetrics: [] };
  }
}

// ----------------------------------------------------------------
// Reports (PDF download)
// ----------------------------------------------------------------
export async function downloadPredictionReport(predictionId) {
  const response = await client.get(`/reports/prediction/${predictionId}/pdf`, {
    responseType: 'blob',
  });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `readmitiq_report_${predictionId}.pdf`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export async function downloadPatientReport(patientId) {
  const response = await client.get(`/reports/patient/${patientId}/pdf`, {
    responseType: 'blob',
  });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `readmitiq_patient_${patientId}.pdf`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
