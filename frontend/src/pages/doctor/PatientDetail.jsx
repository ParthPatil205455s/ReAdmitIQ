import { useState, useEffect, useCallback } from 'react';
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
  RefreshCw,
  Download,
  CheckCircle2,
  DollarSign,
  Building2,
  Stethoscope,
  ShieldAlert,
  AlertCircle,
} from 'lucide-react';
import PageHeader from '../../components/shared/PageHeader';
import RiskBadge from '../../components/shared/RiskBadge';
import Timeline from '../../components/shared/Timeline';
import RiskGauge from '../../components/charts/RiskGauge';
import SHAPWaterfall from '../../components/charts/SHAPWaterfall';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Tabs from '../../components/ui/Tabs';
import {
  fetchPatient,
  fetchMedicalHistory,
  fetchLatestPatientPrediction,
  downloadPatientReport,
} from '../../api/endpoints';

export default function PatientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);
  const [history, setHistory] = useState([]);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const [patientData, historyData, predData] = await Promise.all([
        fetchPatient(id),
        fetchMedicalHistory(id),
        fetchLatestPatientPrediction(id),
      ]);

      if (!patientData) {
        throw new Error('Patient record not found in system.');
      }

      setPatient(patientData);
      setHistory(historyData || []);
      setPrediction(predData || null);
    } catch (err) {
      console.error('Failed to load patient chart:', err);
      setError(err.message || 'Unable to connect to patient database.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDownloadPdf = async () => {
    if (!patient?.id) return;
    setDownloading(true);
    try {
      await downloadPatientReport(patient.id);
    } catch (err) {
      console.error('PDF download error:', err);
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center space-y-4">
        <RefreshCw className="w-8 h-8 text-brand animate-spin" />
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
          Loading patient chart & ML risk profile...
        </p>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="p-8 max-w-xl mx-auto space-y-4 text-center">
        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          Patient Chart Unavailable
        </h3>
        <p className="text-xs text-slate-500">{error || 'Patient could not be loaded.'}</p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Button variant="secondary" size="sm" onClick={() => navigate('/doctor/patients')}>
            Back to Patients
          </Button>
          <Button variant="primary" size="sm" onClick={() => loadData(true)}>
            Retry Loading
          </Button>
        </div>
      </div>
    );
  }

  const riskScore = prediction?.riskScore ?? prediction?.risk_probability ?? patient.riskScore ?? 0.15;
  const riskLevel = (prediction?.riskLevel || prediction?.risk_band || patient.riskLevel || 'low').toLowerCase();
  const topDrivers = prediction?.explanation?.top_drivers || prediction?.shapValues || [];
  const narrative = prediction?.narrative || prediction?.explanation?.narrative || 'Patient exhibits standard post-discharge risk determinants.';
  const interventions = prediction?.interventions || [];

  const tabs = [
    { id: 'overview', label: 'Clinical Overview & ML Risk' },
    { id: 'shap', label: 'SHAP Feature Drivers' },
    { id: 'history', label: 'Past Admissions & EHR History' },
    { id: 'careplan', label: 'Discharge Bundle & Recommendations' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={patient.name || patient.full_name}
        subtitle={`MRN: ${patient.mrn} · Primary Condition: ${patient.primaryDiagnosis || patient.primary_condition || 'N/A'}`}
        badge={<RiskBadge level={riskLevel} size="md" />}
        breadcrumbs={[
          { label: 'Doctor Portal', href: '/doctor/dashboard' },
          { label: 'Patients', href: '/doctor/patients' },
          { label: patient.name || patient.full_name },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => loadData(true)}
              loading={refreshing}
              className="gap-1.5"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={handleDownloadPdf}
              loading={downloading}
              className="gap-1.5"
            >
              <Download className="w-4 h-4" />
              <span>Export PDF Report</span>
            </Button>

            <Link to={`/doctor/assess/${patient.id}`}>
              <Button variant="primary" size="sm" className="gap-1.5 shadow-md shadow-brand/20">
                <Sparkles className="w-4 h-4" />
                <span>Run New Risk Assessment</span>
              </Button>
            </Link>
          </div>
        }
      />

      {/* Patient Top Summary Card */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Patient Demographics */}
        <Card className="p-5 space-y-4 lg:col-span-1">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-brand/10 text-brand flex items-center justify-center font-bold text-lg">
              {(patient.name || patient.full_name || 'P')
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                {patient.name || patient.full_name}
              </h3>
              <p className="text-xs text-slate-500">
                {patient.age} yrs · {patient.gender} · {patient.blood_type || patient.bloodType || 'O+'}
              </p>
            </div>
          </div>

          <div className="space-y-2 text-xs border-t border-slate-100 dark:border-slate-800 pt-3">
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <Stethoscope className="w-3.5 h-3.5 text-slate-400" />
                <span>Primary Condition:</span>
              </span>
              <span className="font-semibold text-slate-900 dark:text-white text-right">
                {patient.primaryDiagnosis || patient.primary_condition}
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span>Insurance / Payer:</span>
              </span>
              <span className="text-slate-900 dark:text-white">
                {patient.insuranceProvider || patient.insurance_provider || 'Medicare'}
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>Email:</span>
              </span>
              <span className="text-slate-900 dark:text-white font-mono text-[11px] truncate max-w-[140px]">
                {patient.contact_email || patient.contactEmail || 'N/A'}
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Registered:</span>
              </span>
              <span className="text-slate-900 dark:text-white font-mono text-[11px]">
                {patient.created_at ? new Date(patient.created_at).toLocaleDateString() : 'Active'}
              </span>
            </div>
          </div>
        </Card>

        {/* Risk Score & Model Summary Card */}
        <Card className="p-5 lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
          <div className="flex flex-col items-center justify-center text-center space-y-2 border-b sm:border-b-0 sm:border-r border-slate-100 dark:border-slate-800 pb-4 sm:pb-0 pr-0 sm:pr-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              30-Day Readmission Probability
            </span>
            <RiskGauge score={riskScore} size={150} />
            <RiskBadge level={riskLevel} size="md" />
          </div>

          <div className="sm:col-span-2 space-y-3">
            <div className="flex items-center gap-2 text-brand font-bold text-sm">
              <Sparkles className="w-4 h-4" />
              <span>Calibrated ML Risk Synthesis</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {narrative}
            </p>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs flex items-center justify-between">
              <div>
                <span className="text-slate-500">ML Algorithm: </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {prediction?.modelVersion || 'RandomForest + Isotonic Calibration'}
                </span>
              </div>
              <div>
                <span className="text-slate-500">Explainability: </span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">TreeSHAP Enabled</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <Tabs tabs={tabs} defaultTab={activeTab} onChange={setActiveTab} />

      {/* Tab 1: Clinical Overview & ML Risk */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="p-6 lg:col-span-2 space-y-4">
            <h4 className="font-bold text-slate-900 dark:text-white text-base">
              High-Impact Risk Drivers & SHAP Attributions
            </h4>
            {topDrivers.length > 0 ? (
              <div className="space-y-3">
                {topDrivers.slice(0, 4).map((d, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <span className="font-semibold text-xs text-slate-900 dark:text-white">
                        {d.display || d.feature}
                      </span>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {d.direction === 'increases' || d.contribution > 0
                          ? 'Increases 30-day readmission risk'
                          : 'Mitigates / decreases readmission risk'}
                      </p>
                    </div>
                    <span
                      className={`text-xs font-mono font-bold px-2 py-1 rounded ${
                        d.direction === 'increases' || d.contribution > 0
                          ? 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400'
                          : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {d.contribution > 0 ? `+${(d.contribution * 100).toFixed(1)}%` : `${(d.contribution * 100).toFixed(1)}%`}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-slate-400 text-xs bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                No high-impact drivers recorded yet. Click "Run New Risk Assessment" to calculate SHAP values.
              </div>
            )}
          </Card>

          <Card className="p-6 space-y-4">
            <h4 className="font-bold text-slate-900 dark:text-white text-base">
              Recent Clinical Milestones
            </h4>
            {history.length > 0 ? (
              <Timeline events={history.slice(0, 4)} />
            ) : (
              <p className="text-xs text-slate-400 text-center py-6">No historical admissions recorded.</p>
            )}
          </Card>
        </div>
      )}

      {/* Tab 2: SHAP Feature Drivers */}
      {activeTab === 'shap' && (
        <Card className="p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                TreeSHAP Feature Attribution Waterfall
              </h3>
              <p className="text-xs text-slate-500">
                Exact mathematical feature contributions calculated by TreeSHAP for patient {patient.name}.
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-red-500" />
                <span className="text-slate-600 dark:text-slate-300">Increases Risk (+)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-emerald-500" />
                <span className="text-slate-600 dark:text-slate-300">Decreases Risk (-)</span>
              </div>
            </div>
          </div>

          <div className="h-80 w-full pt-2">
            <SHAPWaterfall data={topDrivers} />
          </div>
        </Card>
      )}

      {/* Tab 3: Past Admissions & EHR History */}
      {activeTab === 'history' && (
        <Card className="p-6 space-y-4">
          <h4 className="font-bold text-slate-900 dark:text-white text-base">
            Complete Medical History & Past Admissions
          </h4>
          {history.length > 0 ? (
            <Timeline events={history} />
          ) : (
            <div className="p-8 text-center text-slate-400 text-xs">
              No historical admission records found for this patient in database.
            </div>
          )}
        </Card>
      )}

      {/* Tab 4: Discharge Bundle & Recommendations */}
      {activeTab === 'careplan' && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-900 dark:text-white text-base">
              Automated Follow-up & Discharge Recommendations
            </h4>
            <span className="text-xs text-slate-400 font-mono">
              Rule Engine Category: {riskLevel.toUpperCase()}
            </span>
          </div>

          {interventions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {interventions.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-start justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        {item.title}
                      </span>
                      <p className="text-xs text-slate-500 mt-1">{item.description}</p>
                      {item.category && (
                        <span className="inline-block text-[10px] font-mono font-semibold text-slate-400 mt-2">
                          Category: {item.category}
                        </span>
                      )}
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded shrink-0 ${
                      item.priority === 'high'
                        ? 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400'
                        : 'bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400'
                    }`}
                  >
                    {item.priority || 'medium'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 text-xs bg-slate-50 dark:bg-slate-800/40 rounded-xl">
              No specific interventions required based on current low-risk profile.
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
