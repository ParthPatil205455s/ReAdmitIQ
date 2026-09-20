// ================================================================
// ReAdmitIQ — Comprehensive Healthcare Mock Data
// Realistic data matching the API contract
// ================================================================

// ----------------------------------------------------------------
// Patients
// ----------------------------------------------------------------
export const patients = [
  {
    id: 'P-10042',
    name: 'James Wilson',
    age: 67,
    gender: 'Male',
    dob: '1958-03-14',
    phone: '(555) 234-5678',
    email: 'james.wilson@email.com',
    address: '142 Oak Street, Springfield, IL 62704',
    insuranceId: 'BC-887654',
    insuranceProvider: 'Blue Cross Blue Shield',
    primaryPhysician: 'Dr. Sarah Chen',
    admissionDate: '2024-11-02',
    dischargeDate: '2024-11-08',
    riskScore: 0.82,
    riskLevel: 'critical',
    conditions: ['Type 2 Diabetes', 'Congestive Heart Failure', 'Hypertension', 'Chronic Kidney Disease Stage 3'],
    medications: ['Metformin 1000mg', 'Lisinopril 20mg', 'Furosemide 40mg', 'Carvedilol 25mg', 'Atorvastatin 40mg'],
    allergies: ['Penicillin', 'Sulfa drugs'],
    vitals: { bp: '158/94', hr: 88, temp: 98.6, spo2: 93, rr: 20, weight: 198, bmi: 31.2 },
    labResults: { hba1c: 9.2, creatinine: 2.1, egfr: 38, bnp: 890, potassium: 4.8, sodium: 136 },
    lastVisit: '2024-12-15',
    nextAppointment: '2025-01-08',
    status: 'active',
    notes: 'Patient has history of non-compliance with medication regimen. Recent hospitalization for acute decompensated heart failure. Requires close monitoring.',
  },
  {
    id: 'P-10078',
    name: 'Maria Garcia',
    age: 54,
    gender: 'Female',
    dob: '1971-07-22',
    phone: '(555) 345-6789',
    email: 'maria.garcia@email.com',
    address: '88 Elm Avenue, Springfield, IL 62701',
    insuranceId: 'AET-445566',
    insuranceProvider: 'Aetna',
    primaryPhysician: 'Dr. Sarah Chen',
    admissionDate: '2024-10-18',
    dischargeDate: '2024-10-23',
    riskScore: 0.45,
    riskLevel: 'medium',
    conditions: ['COPD', 'Type 2 Diabetes', 'Obesity'],
    medications: ['Tiotropium 18mcg', 'Albuterol PRN', 'Metformin 500mg', 'Glipizide 10mg'],
    allergies: ['Aspirin'],
    vitals: { bp: '134/82', hr: 78, temp: 98.4, spo2: 95, rr: 18, weight: 176, bmi: 29.4 },
    labResults: { hba1c: 7.8, creatinine: 1.0, egfr: 72, bnp: 120, potassium: 4.2, sodium: 140 },
    lastVisit: '2024-12-10',
    nextAppointment: '2025-01-15',
    status: 'active',
    notes: 'Stable COPD with recent exacerbation. Good compliance with inhaler therapy. Needs pulmonary rehab referral.',
  },
  {
    id: 'P-10091',
    name: 'Robert Thompson',
    age: 73,
    gender: 'Male',
    dob: '1952-01-09',
    phone: '(555) 456-7890',
    email: 'r.thompson@email.com',
    address: '305 Maple Drive, Springfield, IL 62702',
    insuranceId: 'MED-998877',
    insuranceProvider: 'Medicare',
    primaryPhysician: 'Dr. David Park',
    admissionDate: '2024-11-20',
    dischargeDate: '2024-11-28',
    riskScore: 0.71,
    riskLevel: 'high',
    conditions: ['Atrial Fibrillation', 'Heart Failure', 'Hypertension', 'Type 2 Diabetes'],
    medications: ['Warfarin 5mg', 'Metoprolol 50mg', 'Lisinopril 10mg', 'Metformin 850mg', 'Digoxin 0.125mg'],
    allergies: [],
    vitals: { bp: '148/88', hr: 92, temp: 98.2, spo2: 94, rr: 22, weight: 185, bmi: 27.8 },
    labResults: { hba1c: 8.1, creatinine: 1.6, egfr: 45, bnp: 650, potassium: 4.5, sodium: 138 },
    lastVisit: '2024-12-18',
    nextAppointment: '2025-01-05',
    status: 'active',
    notes: 'Irregular rate controlled with beta-blocker. INR monitoring required weekly. Recent echo shows EF 35%.',
  },
  {
    id: 'P-10103',
    name: 'Emily Nguyen',
    age: 42,
    gender: 'Female',
    dob: '1983-05-30',
    phone: '(555) 567-8901',
    email: 'emily.nguyen@email.com',
    address: '17 River Road, Springfield, IL 62703',
    insuranceId: 'UHC-223344',
    insuranceProvider: 'UnitedHealth',
    primaryPhysician: 'Dr. Sarah Chen',
    admissionDate: '2024-09-12',
    dischargeDate: '2024-09-15',
    riskScore: 0.18,
    riskLevel: 'low',
    conditions: ['Asthma', 'Anxiety Disorder'],
    medications: ['Fluticasone/Salmeterol 250/50', 'Albuterol PRN', 'Sertraline 50mg'],
    allergies: ['Latex'],
    vitals: { bp: '118/74', hr: 72, temp: 98.6, spo2: 98, rr: 16, weight: 135, bmi: 23.1 },
    labResults: { hba1c: 5.4, creatinine: 0.8, egfr: 105, bnp: 45, potassium: 4.0, sodium: 141 },
    lastVisit: '2024-11-28',
    nextAppointment: '2025-02-10',
    status: 'active',
    notes: 'Well-controlled asthma. No recent exacerbations. Continue current regimen.',
  },
  {
    id: 'P-10115',
    name: 'William Davis',
    age: 81,
    gender: 'Male',
    dob: '1944-11-03',
    phone: '(555) 678-9012',
    email: 'w.davis@email.com',
    address: '220 Pine Street, Springfield, IL 62704',
    insuranceId: 'MED-554433',
    insuranceProvider: 'Medicare',
    primaryPhysician: 'Dr. David Park',
    admissionDate: '2024-12-01',
    dischargeDate: '2024-12-10',
    riskScore: 0.89,
    riskLevel: 'critical',
    conditions: ['CHF NYHA Class III', 'CKD Stage 4', 'Type 2 Diabetes', 'COPD', 'Peripheral Artery Disease'],
    medications: ['Insulin Glargine 30u', 'Furosemide 80mg', 'Spironolactone 25mg', 'Amlodipine 10mg', 'Atorvastatin 80mg', 'Tiotropium 18mcg'],
    allergies: ['ACE Inhibitors', 'Iodine contrast'],
    vitals: { bp: '162/96', hr: 96, temp: 98.8, spo2: 91, rr: 24, weight: 210, bmi: 30.5 },
    labResults: { hba1c: 10.1, creatinine: 3.2, egfr: 22, bnp: 1450, potassium: 5.2, sodium: 133 },
    lastVisit: '2024-12-20',
    nextAppointment: '2025-01-03',
    status: 'active',
    notes: 'Multiple comorbidities with poor functional status. High fall risk. Home health services arranged. Goals of care discussion pending.',
  },
  {
    id: 'P-10128',
    name: 'Sarah Mitchell',
    age: 59,
    gender: 'Female',
    dob: '1966-08-17',
    phone: '(555) 789-0123',
    email: 's.mitchell@email.com',
    address: '55 Cedar Lane, Springfield, IL 62701',
    insuranceId: 'CIG-667788',
    insuranceProvider: 'Cigna',
    primaryPhysician: 'Dr. Sarah Chen',
    admissionDate: '2024-10-05',
    dischargeDate: '2024-10-09',
    riskScore: 0.33,
    riskLevel: 'medium',
    conditions: ['Hypertension', 'Hyperlipidemia', 'Osteoarthritis'],
    medications: ['Losartan 100mg', 'Hydrochlorothiazide 25mg', 'Rosuvastatin 20mg', 'Acetaminophen PRN'],
    allergies: [],
    vitals: { bp: '138/86', hr: 74, temp: 98.5, spo2: 97, rr: 16, weight: 155, bmi: 26.1 },
    labResults: { hba1c: 5.8, creatinine: 0.9, egfr: 85, bnp: 65, potassium: 3.8, sodium: 142 },
    lastVisit: '2024-12-05',
    nextAppointment: '2025-01-20',
    status: 'active',
    notes: 'Blood pressure improving with current regimen. Continue lifestyle modifications.',
  },
  {
    id: 'P-10134',
    name: 'David Kim',
    age: 48,
    gender: 'Male',
    dob: '1977-02-28',
    phone: '(555) 890-1234',
    email: 'd.kim@email.com',
    address: '182 Birch Court, Springfield, IL 62702',
    insuranceId: 'AET-889900',
    insuranceProvider: 'Aetna',
    primaryPhysician: 'Dr. David Park',
    admissionDate: '2024-11-10',
    dischargeDate: '2024-11-13',
    riskScore: 0.22,
    riskLevel: 'low',
    conditions: ['Type 1 Diabetes', 'Depression'],
    medications: ['Insulin Pump', 'Escitalopram 20mg'],
    allergies: ['Codeine'],
    vitals: { bp: '122/78', hr: 68, temp: 98.4, spo2: 99, rr: 14, weight: 165, bmi: 24.3 },
    labResults: { hba1c: 6.8, creatinine: 0.9, egfr: 98, bnp: 30, potassium: 4.1, sodium: 140 },
    lastVisit: '2024-12-12',
    nextAppointment: '2025-01-25',
    status: 'active',
    notes: 'Good glycemic control with insulin pump. Mental health stable on current SSRI.',
  },
  {
    id: 'P-10147',
    name: 'Patricia Brown',
    age: 70,
    gender: 'Female',
    dob: '1955-04-12',
    phone: '(555) 901-2345',
    email: 'p.brown@email.com',
    address: '402 Walnut Street, Springfield, IL 62703',
    insuranceId: 'MED-112233',
    insuranceProvider: 'Medicare',
    primaryPhysician: 'Dr. Sarah Chen',
    admissionDate: '2024-11-28',
    dischargeDate: '2024-12-04',
    riskScore: 0.63,
    riskLevel: 'high',
    conditions: ['Chronic Heart Failure', 'Atrial Fibrillation', 'CKD Stage 3', 'Hypothyroidism'],
    medications: ['Apixaban 5mg', 'Metoprolol 100mg', 'Furosemide 60mg', 'Levothyroxine 75mcg', 'Potassium 20mEq'],
    allergies: ['NSAIDs'],
    vitals: { bp: '142/86', hr: 82, temp: 98.3, spo2: 94, rr: 20, weight: 148, bmi: 25.8 },
    labResults: { hba1c: 5.9, creatinine: 1.8, egfr: 35, bnp: 780, potassium: 4.6, sodium: 137 },
    lastVisit: '2024-12-18',
    nextAppointment: '2025-01-10',
    status: 'active',
    notes: 'Recurrent admissions for fluid overload. Needs dietary sodium counseling. Consider advanced heart failure referral.',
  },
  {
    id: 'P-10155',
    name: 'Michael Johnson',
    age: 62,
    gender: 'Male',
    dob: '1963-09-05',
    phone: '(555) 012-3456',
    email: 'm.johnson@email.com',
    address: '75 Spruce Avenue, Springfield, IL 62704',
    insuranceId: 'UHC-334455',
    insuranceProvider: 'UnitedHealth',
    primaryPhysician: 'Dr. David Park',
    admissionDate: '2024-10-22',
    dischargeDate: '2024-10-26',
    riskScore: 0.51,
    riskLevel: 'high',
    conditions: ['COPD Gold Stage III', 'Sleep Apnea', 'Hypertension', 'Former Smoker'],
    medications: ['Fluticasone/Vilanterol', 'Tiotropium 18mcg', 'CPAP Therapy', 'Lisinopril 20mg'],
    allergies: [],
    vitals: { bp: '140/88', hr: 76, temp: 98.5, spo2: 92, rr: 22, weight: 195, bmi: 28.9 },
    labResults: { hba1c: 5.6, creatinine: 1.1, egfr: 68, bnp: 180, potassium: 4.3, sodium: 139 },
    lastVisit: '2024-12-08',
    nextAppointment: '2025-01-18',
    status: 'active',
    notes: 'COPD with frequent exacerbations. Smoking cessation counseling completed. Pulmonary rehab ongoing.',
  },
  {
    id: 'P-10168',
    name: 'Linda Martinez',
    age: 56,
    gender: 'Female',
    dob: '1969-12-20',
    phone: '(555) 123-4567',
    email: 'l.martinez@email.com',
    address: '310 Ash Street, Springfield, IL 62701',
    insuranceId: 'BC-998877',
    insuranceProvider: 'Blue Cross Blue Shield',
    primaryPhysician: 'Dr. Sarah Chen',
    admissionDate: '2024-09-30',
    dischargeDate: '2024-10-03',
    riskScore: 0.15,
    riskLevel: 'low',
    conditions: ['Controlled Hypertension', 'Migraine'],
    medications: ['Amlodipine 5mg', 'Sumatriptan PRN'],
    allergies: [],
    vitals: { bp: '124/78', hr: 70, temp: 98.6, spo2: 98, rr: 16, weight: 140, bmi: 24.0 },
    labResults: { hba1c: 5.2, creatinine: 0.7, egfr: 110, bnp: 25, potassium: 4.0, sodium: 141 },
    lastVisit: '2024-11-20',
    nextAppointment: '2025-03-01',
    status: 'active',
    notes: 'Excellent blood pressure control. Migraines well managed with PRN therapy.',
  },
  {
    id: 'P-10175',
    name: 'Charles Anderson',
    age: 78,
    gender: 'Male',
    dob: '1947-06-15',
    phone: '(555) 234-5679',
    email: 'c.anderson@email.com',
    address: '88 Dogwood Lane, Springfield, IL 62702',
    insuranceId: 'MED-667788',
    insuranceProvider: 'Medicare',
    primaryPhysician: 'Dr. David Park',
    admissionDate: '2024-12-08',
    dischargeDate: '2024-12-14',
    riskScore: 0.76,
    riskLevel: 'critical',
    conditions: ['CHF', 'CABG x3 (2019)', 'Type 2 Diabetes', 'CKD Stage 3', 'Gout'],
    medications: ['Aspirin 81mg', 'Clopidogrel 75mg', 'Metformin 1000mg', 'Carvedilol 12.5mg', 'Allopurinol 300mg', 'Furosemide 40mg'],
    allergies: ['Morphine'],
    vitals: { bp: '152/90', hr: 84, temp: 98.7, spo2: 93, rr: 20, weight: 192, bmi: 28.4 },
    labResults: { hba1c: 8.4, creatinine: 1.9, egfr: 36, bnp: 920, potassium: 4.9, sodium: 135 },
    lastVisit: '2024-12-20',
    nextAppointment: '2025-01-06',
    status: 'active',
    notes: 'Post-CABG with progressive heart failure. Volume status labile. Cardiology co-management.',
  },
  {
    id: 'P-10189',
    name: 'Jennifer Lee',
    age: 35,
    gender: 'Female',
    dob: '1990-10-08',
    phone: '(555) 345-6780',
    email: 'j.lee@email.com',
    address: '126 Willow Way, Springfield, IL 62703',
    insuranceId: 'AET-112244',
    insuranceProvider: 'Aetna',
    primaryPhysician: 'Dr. Sarah Chen',
    admissionDate: '2024-08-15',
    dischargeDate: '2024-08-17',
    riskScore: 0.08,
    riskLevel: 'low',
    conditions: ['Gestational Diabetes (resolved)', 'Iron Deficiency Anemia'],
    medications: ['Ferrous Sulfate 325mg', 'Prenatal Vitamins'],
    allergies: [],
    vitals: { bp: '112/70', hr: 74, temp: 98.4, spo2: 99, rr: 14, weight: 138, bmi: 22.8 },
    labResults: { hba1c: 5.0, creatinine: 0.6, egfr: 120, bnp: 15, potassium: 3.9, sodium: 142 },
    lastVisit: '2024-10-15',
    nextAppointment: '2025-04-01',
    status: 'active',
    notes: 'Post-partum. Gestational diabetes resolved. Iron levels improving with supplementation.',
  },
];

// ----------------------------------------------------------------
// KPI Stats
// ----------------------------------------------------------------
export const kpiStats = {
  totalPatients: 1247,
  totalPatientsTrend: 3.2,
  highRiskPatients: 89,
  highRiskTrend: -5.1,
  todayAssessments: 24,
  assessmentsTrend: 12.4,
  activeAlerts: 7,
  alertsTrend: -2,
  avgRiskScore: 0.42,
  readmissionRate: 0.128,
  modelAccuracy: 0.924,
  totalPredictions: 3842,
};

// ----------------------------------------------------------------
// SHAP Values (for prediction result)
// ----------------------------------------------------------------
export const shapValues = [
  { feature: 'HbA1c Level', value: 9.2, contribution: 0.18, direction: 'increase', description: 'Significantly elevated (>8.0) indicating poor glycemic control' },
  { feature: 'BNP Level', value: 890, contribution: 0.15, direction: 'increase', description: 'Markedly elevated suggesting active heart failure' },
  { feature: 'Prior Admissions (12mo)', value: 3, contribution: 0.12, direction: 'increase', description: '3 hospitalizations in past year is a strong predictor' },
  { feature: 'eGFR', value: 38, contribution: 0.10, direction: 'increase', description: 'Stage 3b CKD significantly increases risk' },
  { feature: 'Age', value: 67, contribution: 0.08, direction: 'increase', description: 'Advanced age is an independent risk factor' },
  { feature: 'Medication Count', value: 5, contribution: 0.06, direction: 'increase', description: 'Polypharmacy increases complexity and non-adherence risk' },
  { feature: 'Systolic BP', value: 158, contribution: 0.05, direction: 'increase', description: 'Uncontrolled hypertension above target' },
  { feature: 'Length of Stay', value: 6, contribution: 0.04, direction: 'increase', description: 'Extended stay associated with disease severity' },
  { feature: 'BMI', value: 31.2, contribution: 0.03, direction: 'increase', description: 'Obesity complicates CHF management' },
  { feature: 'Social Support', value: 'Moderate', contribution: -0.04, direction: 'decrease', description: 'Family involvement provides some protection' },
  { feature: 'Medication Adherence', value: '62%', contribution: 0.07, direction: 'increase', description: 'Below target adherence rate of 80%' },
  { feature: 'SpO2', value: 93, contribution: 0.03, direction: 'increase', description: 'Borderline hypoxemia at rest' },
];

// ----------------------------------------------------------------
// Risk Distribution
// ----------------------------------------------------------------
export const riskDistribution = [
  { name: 'Low', value: 520, percentage: 41.7, color: '#10B981' },
  { name: 'Medium', value: 380, percentage: 30.5, color: '#F59E0B' },
  { name: 'High', value: 258, percentage: 20.7, color: '#EF4444' },
  { name: 'Critical', value: 89, percentage: 7.1, color: '#DC2626' },
];

// ----------------------------------------------------------------
// Trend Data (Monthly)
// ----------------------------------------------------------------
export const trendData = [
  { month: 'Jul', predictions: 280, readmissions: 34, avgRisk: 0.38 },
  { month: 'Aug', predictions: 310, readmissions: 38, avgRisk: 0.40 },
  { month: 'Sep', predictions: 345, readmissions: 42, avgRisk: 0.41 },
  { month: 'Oct', predictions: 390, readmissions: 39, avgRisk: 0.39 },
  { month: 'Nov', predictions: 420, readmissions: 36, avgRisk: 0.37 },
  { month: 'Dec', predictions: 450, readmissions: 32, avgRisk: 0.35 },
];

// ----------------------------------------------------------------
// Admission Trends (Weekly)
// ----------------------------------------------------------------
export const admissionTrends = [
  { week: 'W1', admissions: 42, readmissions: 5, predicted: 6 },
  { week: 'W2', admissions: 38, readmissions: 4, predicted: 5 },
  { week: 'W3', admissions: 45, readmissions: 7, predicted: 6 },
  { week: 'W4', admissions: 40, readmissions: 3, predicted: 4 },
  { week: 'W5', admissions: 48, readmissions: 6, predicted: 7 },
  { week: 'W6', admissions: 36, readmissions: 4, predicted: 5 },
  { week: 'W7', admissions: 44, readmissions: 5, predicted: 5 },
  { week: 'W8', admissions: 41, readmissions: 4, predicted: 4 },
];

// ----------------------------------------------------------------
// Notifications
// ----------------------------------------------------------------
export const notifications = [
  { id: 'n-001', type: 'alert', title: 'Critical Risk Alert', message: 'William Davis (P-10115) risk score increased to 89%. Immediate review recommended.', time: '2024-12-20T14:30:00', read: false, patientId: 'P-10115' },
  { id: 'n-002', type: 'alert', title: 'High Risk Alert', message: 'Charles Anderson (P-10175) readmitted within 30 days. Risk score: 76%.', time: '2024-12-20T13:15:00', read: false, patientId: 'P-10175' },
  { id: 'n-003', type: 'info', title: 'Assessment Complete', message: 'Risk assessment for Maria Garcia (P-10078) completed successfully.', time: '2024-12-20T11:45:00', read: false, patientId: 'P-10078' },
  { id: 'n-004', type: 'success', title: 'Model Update', message: 'Prediction model v2.4.1 deployed successfully. AUC improved to 0.924.', time: '2024-12-19T16:30:00', read: true },
  { id: 'n-005', type: 'warning', title: 'Lab Results Pending', message: 'Robert Thompson (P-10091) has pending lab results that may affect risk score.', time: '2024-12-19T10:00:00', read: true, patientId: 'P-10091' },
  { id: 'n-006', type: 'info', title: 'Discharge Summary', message: 'Patricia Brown (P-10147) discharge summary available for review.', time: '2024-12-18T15:20:00', read: true, patientId: 'P-10147' },
  { id: 'n-007', type: 'alert', title: 'Missed Appointment', message: 'James Wilson (P-10042) missed follow-up appointment on Dec 15.', time: '2024-12-18T09:00:00', read: true, patientId: 'P-10042' },
  { id: 'n-008', type: 'success', title: 'Care Plan Updated', message: 'Care plan for Emily Nguyen (P-10103) has been updated by Dr. Chen.', time: '2024-12-17T14:45:00', read: true, patientId: 'P-10103' },
];

// ----------------------------------------------------------------
// Recent Activity
// ----------------------------------------------------------------
export const recentActivity = [
  { id: 'a-001', action: 'Risk assessment completed', patient: 'James Wilson', detail: 'Score: 82% (Critical)', time: '2024-12-20T14:30:00', type: 'assessment', icon: 'activity' },
  { id: 'a-002', action: 'Patient discharged', patient: 'William Davis', detail: 'LOS: 9 days, Follow-up scheduled', time: '2024-12-20T12:00:00', type: 'discharge', icon: 'log-out' },
  { id: 'a-003', action: 'New admission', patient: 'Charles Anderson', detail: 'Readmission — CHF exacerbation', time: '2024-12-20T08:15:00', type: 'admission', icon: 'log-in' },
  { id: 'a-004', action: 'Lab results received', patient: 'Maria Garcia', detail: 'HbA1c: 7.8%, eGFR: 72', time: '2024-12-19T16:45:00', type: 'lab', icon: 'file-text' },
  { id: 'a-005', action: 'Prediction model updated', patient: null, detail: 'v2.4.1 — AUC: 0.924', time: '2024-12-19T14:00:00', type: 'system', icon: 'cpu' },
  { id: 'a-006', action: 'Care plan modified', patient: 'Robert Thompson', detail: 'Added cardiology referral', time: '2024-12-19T11:30:00', type: 'care-plan', icon: 'clipboard' },
  { id: 'a-007', action: 'Risk assessment completed', patient: 'Patricia Brown', detail: 'Score: 63% (High)', time: '2024-12-18T15:20:00', type: 'assessment', icon: 'activity' },
  { id: 'a-008', action: 'Medication reconciliation', patient: 'Emily Nguyen', detail: 'Updated inhaler regimen', time: '2024-12-18T10:00:00', type: 'medication', icon: 'pill' },
];

// ----------------------------------------------------------------
// Prediction Result (detailed — for flagship page)
// ----------------------------------------------------------------
export const predictionResult = {
  id: 'pred-2024-1220-001',
  patientId: 'P-10042',
  patientName: 'James Wilson',
  timestamp: '2024-12-20T14:30:00',
  modelVersion: 'v2.4.1',
  riskScore: 0.82,
  riskLevel: 'critical',
  riskBand: { label: 'Critical Risk', range: '75-100%', color: '#DC2626' },
  confidence: 0.91,
  narrative: `Based on the comprehensive analysis of James Wilson's clinical profile, the ReAdmitIQ model identifies a **critical readmission risk** of 82%. The primary drivers include poorly controlled diabetes (HbA1c 9.2%), significantly elevated BNP levels (890 pg/mL) indicating active heart failure decompensation, and a pattern of 3 hospitalizations within the past 12 months. The combination of Stage 3b chronic kidney disease (eGFR 38) and medication non-adherence (62%) creates a compounding effect that substantially elevates the 30-day readmission probability. Immediate clinical intervention is strongly recommended.`,
  interventions: [
    { id: 'int-1', priority: 'critical', title: 'Endocrinology Consultation', description: 'Urgent referral for insulin optimization and glycemic management given HbA1c of 9.2%', timeline: 'Within 48 hours', category: 'Specialist Referral' },
    { id: 'int-2', priority: 'critical', title: 'Heart Failure Clinic Enrollment', description: 'Enroll in structured heart failure management program with remote monitoring', timeline: 'Within 1 week', category: 'Care Program' },
    { id: 'int-3', priority: 'high', title: 'Medication Adherence Program', description: 'Implement pill organizer, medication reminders, and pharmacy synchronization', timeline: 'Before discharge', category: 'Medication Management' },
    { id: 'int-4', priority: 'high', title: 'Nephrology Follow-up', description: 'Schedule nephrology consultation for CKD Stage 3b management and renal protection', timeline: 'Within 2 weeks', category: 'Specialist Referral' },
    { id: 'int-5', priority: 'medium', title: 'Dietary Counseling', description: 'Sodium-restricted, diabetic diet education with registered dietitian', timeline: 'Within 1 week', category: 'Lifestyle' },
    { id: 'int-6', priority: 'medium', title: 'Home Health Assessment', description: 'Arrange home health nursing visits for vitals monitoring and medication administration', timeline: 'Within 3 days post-discharge', category: 'Post-Discharge' },
    { id: 'int-7', priority: 'low', title: 'Patient Education', description: 'Provide heart failure self-management education materials and daily weight monitoring instructions', timeline: 'Before discharge', category: 'Education' },
  ],
  assessmentHistory: [
    { date: '2024-12-20', score: 0.82, level: 'critical' },
    { date: '2024-11-08', score: 0.74, level: 'high' },
    { date: '2024-09-15', score: 0.68, level: 'high' },
    { date: '2024-07-22', score: 0.55, level: 'high' },
    { date: '2024-05-10', score: 0.48, level: 'medium' },
    { date: '2024-03-01', score: 0.42, level: 'medium' },
  ],
};

// ----------------------------------------------------------------
// Interventions by priority (for care plan)
// ----------------------------------------------------------------
export const carePlanItems = [
  { id: 'cp-1', task: 'Take all medications as prescribed', completed: true, category: 'Medication', dueDate: 'Daily' },
  { id: 'cp-2', task: 'Check blood sugar before meals', completed: true, category: 'Monitoring', dueDate: 'Daily' },
  { id: 'cp-3', task: 'Record daily weight', completed: false, category: 'Monitoring', dueDate: 'Daily' },
  { id: 'cp-4', task: 'Follow low-sodium diet (<2g/day)', completed: false, category: 'Diet', dueDate: 'Daily' },
  { id: 'cp-5', task: 'Walk 15 minutes after meals', completed: false, category: 'Exercise', dueDate: 'Daily' },
  { id: 'cp-6', task: 'Attend heart failure clinic', completed: false, category: 'Appointment', dueDate: '2025-01-08' },
  { id: 'cp-7', task: 'Endocrinology consultation', completed: false, category: 'Appointment', dueDate: '2025-01-10' },
  { id: 'cp-8', task: 'Nephrology follow-up', completed: false, category: 'Appointment', dueDate: '2025-01-15' },
  { id: 'cp-9', task: 'Complete pulmonary rehab referral', completed: true, category: 'Referral', dueDate: '2025-01-05' },
  { id: 'cp-10', task: 'Home health nursing visit', completed: false, category: 'Home Care', dueDate: '2025-01-04' },
];

// ----------------------------------------------------------------
// Appointments
// ----------------------------------------------------------------
export const appointments = [
  { id: 'apt-1', title: 'Follow-up with Dr. Chen', date: '2025-01-08', time: '10:00 AM', type: 'In-Person', department: 'Internal Medicine', status: 'scheduled' },
  { id: 'apt-2', title: 'Endocrinology Consultation', date: '2025-01-10', time: '2:00 PM', type: 'In-Person', department: 'Endocrinology', status: 'scheduled' },
  { id: 'apt-3', title: 'Lab Work (HbA1c, BMP)', date: '2025-01-07', time: '8:00 AM', type: 'Lab', department: 'Laboratory', status: 'scheduled' },
  { id: 'apt-4', title: 'Nephrology Follow-up', date: '2025-01-15', time: '11:00 AM', type: 'Telehealth', department: 'Nephrology', status: 'scheduled' },
  { id: 'apt-5', title: 'Heart Failure Clinic', date: '2025-01-22', time: '9:30 AM', type: 'In-Person', department: 'Cardiology', status: 'scheduled' },
];

// ----------------------------------------------------------------
// Model Performance Metrics
// ----------------------------------------------------------------
export const modelMetrics = {
  version: 'v2.4.1',
  lastTrained: '2024-12-15',
  trainingSize: 45000,
  accuracy: 0.924,
  auc: 0.938,
  precision: 0.891,
  recall: 0.912,
  f1Score: 0.901,
  specificity: 0.934,
  sensitivity: 0.912,
  brier: 0.078,
  rocCurve: [
    { fpr: 0.0, tpr: 0.0 },
    { fpr: 0.02, tpr: 0.35 },
    { fpr: 0.05, tpr: 0.55 },
    { fpr: 0.08, tpr: 0.68 },
    { fpr: 0.1, tpr: 0.75 },
    { fpr: 0.15, tpr: 0.82 },
    { fpr: 0.2, tpr: 0.87 },
    { fpr: 0.3, tpr: 0.91 },
    { fpr: 0.4, tpr: 0.94 },
    { fpr: 0.5, tpr: 0.96 },
    { fpr: 0.6, tpr: 0.97 },
    { fpr: 0.7, tpr: 0.98 },
    { fpr: 0.8, tpr: 0.99 },
    { fpr: 1.0, tpr: 1.0 },
  ],
  calibrationCurve: [
    { predicted: 0.1, observed: 0.09 },
    { predicted: 0.2, observed: 0.18 },
    { predicted: 0.3, observed: 0.28 },
    { predicted: 0.4, observed: 0.38 },
    { predicted: 0.5, observed: 0.52 },
    { predicted: 0.6, observed: 0.58 },
    { predicted: 0.7, observed: 0.71 },
    { predicted: 0.8, observed: 0.78 },
    { predicted: 0.9, observed: 0.91 },
  ],
  featureImportance: [
    { feature: 'Prior Admissions (12mo)', importance: 0.18 },
    { feature: 'BNP Level', importance: 0.15 },
    { feature: 'HbA1c', importance: 0.14 },
    { feature: 'eGFR', importance: 0.12 },
    { feature: 'Age', importance: 0.09 },
    { feature: 'Medication Adherence', importance: 0.08 },
    { feature: 'Length of Stay', importance: 0.07 },
    { feature: 'Comorbidity Count', importance: 0.06 },
    { feature: 'Systolic BP', importance: 0.05 },
    { feature: 'BMI', importance: 0.04 },
  ],
  driftMetrics: [
    { month: 'Jul', psi: 0.02, accuracy: 0.918 },
    { month: 'Aug', psi: 0.03, accuracy: 0.921 },
    { month: 'Sep', psi: 0.02, accuracy: 0.919 },
    { month: 'Oct', psi: 0.04, accuracy: 0.916 },
    { month: 'Nov', psi: 0.03, accuracy: 0.922 },
    { month: 'Dec', psi: 0.02, accuracy: 0.924 },
  ],
};

// ----------------------------------------------------------------
// Admin — Users
// ----------------------------------------------------------------
export const users = [
  { id: 'usr-001', name: 'Dr. Sarah Chen', email: 'sarah.chen@metropolitan.health', role: 'doctor', department: 'Internal Medicine', status: 'active', lastLogin: '2024-12-20T14:30:00', predictions: 342 },
  { id: 'usr-002', name: 'Dr. David Park', email: 'david.park@metropolitan.health', role: 'doctor', department: 'Cardiology', status: 'active', lastLogin: '2024-12-20T13:15:00', predictions: 287 },
  { id: 'usr-003', name: 'Dr. Lisa Wang', email: 'lisa.wang@metropolitan.health', role: 'doctor', department: 'Pulmonology', status: 'active', lastLogin: '2024-12-19T16:45:00', predictions: 198 },
  { id: 'usr-004', name: 'Michael Torres', email: 'michael.torres@metropolitan.health', role: 'admin', department: 'Health IT', status: 'active', lastLogin: '2024-12-20T15:00:00', predictions: 0 },
  { id: 'usr-005', name: 'Rachel Adams', email: 'rachel.adams@metropolitan.health', role: 'nurse', department: 'Internal Medicine', status: 'active', lastLogin: '2024-12-20T12:00:00', predictions: 156 },
  { id: 'usr-006', name: 'Dr. James Morton', email: 'james.morton@metropolitan.health', role: 'doctor', department: 'Nephrology', status: 'inactive', lastLogin: '2024-11-15T10:00:00', predictions: 89 },
  { id: 'usr-007', name: 'Karen Phillips', email: 'karen.phillips@metropolitan.health', role: 'nurse', department: 'Cardiology', status: 'active', lastLogin: '2024-12-20T11:30:00', predictions: 124 },
  { id: 'usr-008', name: 'Dr. Amanda Foster', email: 'amanda.foster@metropolitan.health', role: 'doctor', department: 'Endocrinology', status: 'active', lastLogin: '2024-12-18T09:15:00', predictions: 215 },
];

// ----------------------------------------------------------------
// Audit Logs
// ----------------------------------------------------------------
export const auditLogs = [
  { id: 'log-001', timestamp: '2024-12-20T14:30:00', user: 'Dr. Sarah Chen', action: 'Risk Assessment', resource: 'Patient P-10042', detail: 'Generated prediction — Score: 82%', severity: 'info' },
  { id: 'log-002', timestamp: '2024-12-20T14:00:00', user: 'System', action: 'Model Deployed', resource: 'Model v2.4.1', detail: 'Production deployment completed', severity: 'success' },
  { id: 'log-003', timestamp: '2024-12-20T13:15:00', user: 'Dr. David Park', action: 'Patient Record Access', resource: 'Patient P-10175', detail: 'Viewed clinical history', severity: 'info' },
  { id: 'log-004', timestamp: '2024-12-20T12:00:00', user: 'Rachel Adams', action: 'Care Plan Update', resource: 'Patient P-10091', detail: 'Modified medication schedule', severity: 'info' },
  { id: 'log-005', timestamp: '2024-12-20T11:00:00', user: 'Michael Torres', action: 'User Management', resource: 'User usr-006', detail: 'Deactivated user account', severity: 'warning' },
  { id: 'log-006', timestamp: '2024-12-19T16:30:00', user: 'System', action: 'Model Training', resource: 'Model v2.4.1', detail: 'Training completed — AUC: 0.938', severity: 'success' },
  { id: 'log-007', timestamp: '2024-12-19T14:00:00', user: 'Dr. Sarah Chen', action: 'Report Generated', resource: 'Patient P-10078', detail: 'Monthly risk assessment report', severity: 'info' },
  { id: 'log-008', timestamp: '2024-12-19T10:00:00', user: 'System', action: 'Alert Triggered', resource: 'Patient P-10115', detail: 'Risk threshold exceeded — Score: 89%', severity: 'warning' },
];

// ----------------------------------------------------------------
// Hospital-wide analytics
// ----------------------------------------------------------------
export const hospitalAnalytics = {
  totalBeds: 450,
  occupancyRate: 0.87,
  avgLengthOfStay: 4.8,
  readmissionRate30Day: 0.128,
  departmentMetrics: [
    { department: 'Internal Medicine', patients: 320, avgRisk: 0.42, readmissions: 18 },
    { department: 'Cardiology', patients: 280, avgRisk: 0.51, readmissions: 22 },
    { department: 'Pulmonology', patients: 195, avgRisk: 0.38, readmissions: 12 },
    { department: 'Nephrology', patients: 145, avgRisk: 0.55, readmissions: 14 },
    { department: 'Endocrinology', patients: 210, avgRisk: 0.35, readmissions: 10 },
    { department: 'General Surgery', patients: 97, avgRisk: 0.22, readmissions: 4 },
  ],
  monthlyPredictions: [
    { month: 'Jan', count: 312 },
    { month: 'Feb', count: 298 },
    { month: 'Mar', count: 340 },
    { month: 'Apr', count: 355 },
    { month: 'May', count: 378 },
    { month: 'Jun', count: 390 },
    { month: 'Jul', count: 412 },
    { month: 'Aug', count: 425 },
    { month: 'Sep', count: 445 },
    { month: 'Oct', count: 460 },
    { month: 'Nov', count: 478 },
    { month: 'Dec', count: 450 },
  ],
};

// ----------------------------------------------------------------
// Medical History Timeline
// ----------------------------------------------------------------
export const medicalHistory = [
  { date: '2024-12-01', event: 'Hospital Admission', detail: 'Acute decompensated heart failure. IV diuretics initiated.', type: 'admission' },
  { date: '2024-11-15', event: 'Lab Results', detail: 'HbA1c: 9.2%, BNP: 890. Medication adjustment recommended.', type: 'lab' },
  { date: '2024-11-02', event: 'Emergency Visit', detail: 'Shortness of breath and bilateral lower extremity edema.', type: 'emergency' },
  { date: '2024-10-20', event: 'Office Visit', detail: 'Routine follow-up. Increased Furosemide to 40mg BID.', type: 'visit' },
  { date: '2024-09-15', event: 'Risk Assessment', detail: 'ReAdmitIQ score: 68% (High Risk). Care plan updated.', type: 'assessment' },
  { date: '2024-08-10', event: 'Hospital Discharge', detail: 'Discharged after 5-day stay for CHF exacerbation.', type: 'discharge' },
  { date: '2024-08-05', event: 'Hospital Admission', detail: 'CHF exacerbation with 8lb weight gain over 5 days.', type: 'admission' },
  { date: '2024-07-22', event: 'Risk Assessment', detail: 'ReAdmitIQ score: 55% (High Risk). Added to monitoring.', type: 'assessment' },
  { date: '2024-06-15', event: 'Specialist Visit', detail: 'Nephrology consultation. CKD Stage 3b confirmed.', type: 'visit' },
  { date: '2024-05-10', event: 'Risk Assessment', detail: 'ReAdmitIQ score: 48% (Medium Risk). Baseline assessment.', type: 'assessment' },
];

// ----------------------------------------------------------------
// Testimonials (for landing page)
// ----------------------------------------------------------------
export const testimonials = [
  {
    name: 'Dr. Rebecca Foster',
    role: 'Chief Medical Officer',
    hospital: 'Stanford Health Care',
    quote: 'ReAdmitIQ has transformed how we approach discharge planning. We\'ve reduced our 30-day readmission rate by 23% in just six months.',
    avatar: null,
  },
  {
    name: 'Dr. Michael Chang',
    role: 'Director of Quality Improvement',
    hospital: 'Mayo Clinic',
    quote: 'The SHAP-based explanations give our clinicians the confidence to act on predictions. It\'s not a black box — it\'s a clinical partner.',
    avatar: null,
  },
  {
    name: 'Sarah Jennings, RN',
    role: 'Nurse Manager, Heart Failure Unit',
    hospital: 'Johns Hopkins Hospital',
    quote: 'The patient dashboard makes it easy for our patients to understand their risk and stay engaged with their care plan. Game-changing.',
    avatar: null,
  },
];

// ----------------------------------------------------------------
// Landing Page Features
// ----------------------------------------------------------------
export const landingFeatures = [
  {
    icon: 'brain',
    title: 'AI-Powered Predictions',
    description: 'Gradient-boosted ensemble model trained on 45,000+ patient records with 92.4% accuracy.',
  },
  {
    icon: 'shield-check',
    title: 'Explainable AI',
    description: 'SHAP-based feature attribution provides transparent, clinician-friendly explanations for every prediction.',
  },
  {
    icon: 'activity',
    title: 'Real-Time Monitoring',
    description: 'Continuous risk stratification with automated alerts when patient risk scores cross clinical thresholds.',
  },
  {
    icon: 'users',
    title: 'Multi-Role Access',
    description: 'Tailored dashboards for physicians, nurses, patients, and administrators with role-based permissions.',
  },
  {
    icon: 'trending-down',
    title: 'Reduced Readmissions',
    description: 'Hospitals using ReAdmitIQ report a 23% average reduction in 30-day readmission rates.',
  },
  {
    icon: 'lock',
    title: 'HIPAA Compliant',
    description: 'Enterprise-grade security with end-to-end encryption, audit logging, and SOC 2 Type II compliance.',
  },
];

// ----------------------------------------------------------------
// Landing Page Stats
// ----------------------------------------------------------------
export const landingStats = [
  { label: 'Prediction Accuracy', value: '92.4%', icon: 'target' },
  { label: 'Patients Monitored', value: '45K+', icon: 'users' },
  { label: 'Readmission Reduction', value: '23%', icon: 'trending-down' },
  { label: 'Hospitals Active', value: '12', icon: 'building-2' },
];
