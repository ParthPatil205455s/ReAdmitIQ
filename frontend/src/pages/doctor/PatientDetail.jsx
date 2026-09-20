import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Activity,
  Heart,
  Calendar,
  Pill,
  FileText,
  AlertTriangle,
  Sparkles,
  ClipboardCheck,
  User,
  Phone,
  Mail,
  Home,
} from 'lucide-react';
import PageHeader from '../../components/shared/PageHeader';
import RiskBadge from '../../components/shared/RiskBadge';
import Timeline from '../../components/shared/Timeline';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Tabs from '../../components/ui/Tabs';
import { fetchPatient, fetchMedicalHistory } from '../../api/endpoints';
import { medicalHistory as defaultHistory, patients as allPatients } from '../../data/mockData';

export default function PatientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchPatient(id).then((p) => {
      if (p) setPatient(p);
      else setPatient(allPatients[0]);
    });
    fetchMedicalHistory(id).then((h) => {
      if (h && h.length > 0) setHistory(h);
      else setHistory(defaultHistory);
    });
  }, [id]);

  if (!patient) {
    return (
      <div className="p-12 text-center text-slate-400">Loading patient chart...</div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Clinical Overview' },
    { id: 'history', label: 'Past Admissions & History' },
    { id: 'medications', label: 'Medication Reconciliation' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={patient.name}
        subtitle={`MRN: ${patient.mrn} · Inpatient Admission: ${patient.admissionDate || '2026-09-12'}`}
        badge={<RiskBadge level={patient.riskLevel} size="md" />}
        breadcrumbs={[
          { label: 'Doctor Portal', href: '/doctor/dashboard' },
          { label: 'Patients', href: '/doctor/patients' },
          { label: patient.name },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Link to={`/doctor/assess/${patient.id}`}>
              <Button variant="secondary" size="sm" className="gap-1.5">
                <ClipboardCheck className="w-4 h-4" />
                <span>Update Assessment</span>
              </Button>
            </Link>
            <Link to={`/doctor/predictions/${patient.id}`}>
              <Button variant="primary" size="sm" className="gap-1.5 shadow-md shadow-brand/20">
                <Sparkles className="w-4 h-4" />
                <span>View AI Rationale</span>
              </Button>
            </Link>
          </div>
        }
      />

      {/* Patient Header Card */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Demographics */}
        <Card className="p-5 lg:col-span-1 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold text-lg">
              {patient.name.split(' ').map((n) => n[0]).join('')}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                {patient.name}
              </h3>
              <p className="text-xs text-slate-500">
                {patient.age} yrs · {patient.gender}
              </p>
            </div>
          </div>

          <div className="space-y-2 text-xs border-t border-slate-100 dark:border-slate-800 pt-3">
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
              <span>Primary Diagnosis:</span>
              <span className="font-semibold text-slate-900 dark:text-white text-right">
                {patient.primaryDiagnosis || patient.condition}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
              <span>Attending Physician:</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {patient.attendingPhysician || 'Dr. Sarah Chen'}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
              <span>Unit / Bed:</span>
              <span className="font-mono text-slate-900 dark:text-white">
                {patient.roomNumber || 'West Wing 402-B'}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
              <span>Insurance / Payer:</span>
              <span className="text-slate-900 dark:text-white">
                {patient.insurance || 'Medicare Advantage'}
              </span>
            </div>
          </div>
        </Card>

        {/* Vitals Summary Grid */}
        <div className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="p-4 flex flex-col justify-between">
            <span className="text-xs text-slate-500 font-medium">Blood Pressure</span>
            <p className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-2">
              {patient.vitals?.bp || '138/86'}
              <span className="text-xs text-slate-400 font-normal ml-1">mmHg</span>
            </p>
            <span className="text-[10px] text-amber-500 font-medium mt-1">Stage 1 HTN</span>
          </Card>

          <Card className="p-4 flex flex-col justify-between">
            <span className="text-xs text-slate-500 font-medium">Heart Rate</span>
            <p className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-2">
              {patient.vitals?.heartRate || '82'}
              <span className="text-xs text-slate-400 font-normal ml-1">bpm</span>
            </p>
            <span className="text-[10px] text-emerald-500 font-medium mt-1">Normal Sinus</span>
          </Card>

          <Card className="p-4 flex flex-col justify-between">
            <span className="text-xs text-slate-500 font-medium">Oxygen Saturation</span>
            <p className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-2">
              {patient.vitals?.spo2 || '96%'}
            </p>
            <span className="text-[10px] text-emerald-500 font-medium mt-1">Room Air</span>
          </Card>

          <Card className="p-4 flex flex-col justify-between">
            <span className="text-xs text-slate-500 font-medium">HbA1c Lab</span>
            <p className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-2">
              {patient.vitals?.hba1c || '8.4%'}
            </p>
            <span className="text-[10px] text-red-500 font-medium mt-1">Elevated (SHAP +0.18)</span>
          </Card>
        </div>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} defaultTab={activeTab} onChange={setActiveTab} />

      {/* Tab Panels */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="p-5 lg:col-span-2 space-y-4">
            <h4 className="font-bold text-slate-900 dark:text-white text-sm">
              Clinical Assessment & Risk Rationale
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Patient is an adult with a primary admission for decompensated heart failure and chronic kidney disease stage 3.
              Machine learning risk inference estimates a{' '}
              <strong className="text-brand font-mono font-bold">
                {Math.round(patient.riskScore * 100)}% probability
              </strong>{' '}
              of 30-day post-discharge readmission.
            </p>

            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 font-semibold text-xs">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>High-Impact AI Drivers Identified for this Inpatient</span>
              </div>
              <ul className="text-xs text-amber-800 dark:text-amber-200 list-disc list-inside space-y-1">
                <li>High polypharmacy index (9 current active prescriptions)</li>
                <li>HbA1c of 8.4% indicating sub-optimally managed diabetes</li>
                <li>2 prior emergency department visits in past 6 months</li>
                <li>Lives alone with limited post-discharge caregiver support</li>
              </ul>
            </div>
          </Card>

          <Card className="p-5 space-y-4">
            <h4 className="font-bold text-slate-900 dark:text-white text-sm">
              Recent Clinical Milestones
            </h4>
            <Timeline events={history.slice(0, 4)} />
          </Card>
        </div>
      )}

      {activeTab === 'history' && (
        <Card className="p-6">
          <h4 className="font-bold text-slate-900 dark:text-white text-base mb-4">
            Complete Medical History & Past Admissions
          </h4>
          <Timeline events={history} />
        </Card>
      )}

      {activeTab === 'medications' && (
        <Card className="p-6 space-y-4">
          <h4 className="font-bold text-slate-900 dark:text-white text-base">
            Active Medications & Adherence Risk
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { name: 'Lisinopril', dose: '20 mg Oral Tablet', freq: 'Once daily', indication: 'Hypertension / Heart Failure' },
              { name: 'Metformin HCl', dose: '1000 mg Oral Tablet', freq: 'Twice daily with meals', indication: 'Type 2 Diabetes' },
              { name: 'Furosemide (Lasix)', dose: '40 mg Oral Tablet', freq: 'Every morning', indication: 'Fluid Retention / Edema' },
              { name: 'Atorvastatin', dose: '40 mg Oral Tablet', freq: 'At bedtime', indication: 'Hyperlipidemia' },
              { name: 'Carvedilol', dose: '12.5 mg Oral Tablet', freq: 'Twice daily', indication: 'Cardioprotection' },
            ].map((med, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-start justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <Pill className="w-4 h-4 text-brand" />
                    <span className="font-bold text-sm text-slate-900 dark:text-white">{med.name}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{med.dose} · {med.freq}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{med.indication}</p>
                </div>
                <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                  Reconciled
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
