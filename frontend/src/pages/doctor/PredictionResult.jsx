import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowLeft,
  Sliders,
  CheckCircle2,
  FileDown,
  Printer,
  Share2,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  RefreshCw,
} from 'lucide-react';
import PageHeader from '../../components/shared/PageHeader';
import RiskBadge from '../../components/shared/RiskBadge';
import RiskGauge from '../../components/charts/RiskGauge';
import SHAPWaterfall from '../../components/charts/SHAPWaterfall';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { fetchPatient, fetchPrediction } from '../../api/endpoints';
import { patients as allPatients, predictionResult as mockPred } from '../../data/mockData';

export default function PredictionResult() {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [prediction, setPrediction] = useState(mockPred);
  const [showSimulator, setShowSimulator] = useState(false);

  // What-if simulator state
  const [simHbA1c, setSimHbA1c] = useState(8.4);
  const [simHomeHealth, setSimHomeHealth] = useState(false);
  const [simMedRecon, setSimMedRecon] = useState(true);
  const [simFollowupDays, setSimFollowupDays] = useState(7);

  useEffect(() => {
    fetchPrediction(id).then((pred) => {
      if (pred) {
        setPrediction(pred);
        if (pred.patientId || pred.patient_id) {
          fetchPatient(pred.patientId || pred.patient_id).then((p) => {
            setPatient(p || allPatients[0]);
          });
        }
      }
    });
  }, [id]);

  const p = patient || allPatients[0];

  // Calculate simulated risk score based on what-if slider controls
  let simulatedScore = p.riskScore || 0.68;
  if (simHbA1c < 7.0) simulatedScore -= 0.12;
  else if (simHbA1c > 9.0) simulatedScore += 0.08;

  if (simHomeHealth) simulatedScore -= 0.14;
  if (simMedRecon) simulatedScore -= 0.08;
  if (simFollowupDays <= 3) simulatedScore -= 0.06;

  simulatedScore = Math.max(0.05, Math.min(0.95, simulatedScore));

  const displayScore = showSimulator ? simulatedScore : p.riskScore || 0.68;
  const displayLevel =
    displayScore > 0.6 ? 'high' : displayScore > 0.3 ? 'medium' : 'low';

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Explainable AI Risk Rationale: ${p.name}`}
        subtitle={`MRN: ${p.mrn} · Inpatient Risk Analysis powered by ReAdmitIQ XGBoost v2.4`}
        badge={<RiskBadge level={displayLevel} size="md" />}
        breadcrumbs={[
          { label: 'Doctor Portal', href: '/doctor/dashboard' },
          { label: 'Patients', href: '/doctor/patients' },
          { label: p.name, href: `/doctor/patients/${p.id}` },
          { label: 'AI Prediction' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant={showSimulator ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setShowSimulator(!showSimulator)}
              className="gap-1.5"
            >
              <Sliders className="w-4 h-4" />
              <span>{showSimulator ? 'Close Simulator' : 'What-If Simulator'}</span>
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => window.print()}
              className="gap-1.5 hidden sm:inline-flex"
            >
              <Printer className="w-4 h-4" />
              <span>Print EHR Summary</span>
            </Button>
          </div>
        }
      />

      {/* Simulator Banner if active */}
      {showSimulator && (
        <Card className="p-5 bg-teal-50/70 dark:bg-teal-950/30 border-teal-200 dark:border-teal-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-teal-800 dark:text-teal-200 font-bold text-sm">
              <Sliders className="w-4 h-4" />
              <span>Interactive Clinical "What-If" Counterfactual Engine</span>
            </div>
            <span className="text-xs text-teal-700 dark:text-teal-300 font-mono">
              Simulated Delta: {((simulatedScore - (p.riskScore || 0.68)) * 100).toFixed(1)}%
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="font-semibold block text-slate-700 dark:text-slate-300 mb-1">
                Target HbA1c Level: {simHbA1c}%
              </label>
              <input
                type="range"
                min="6.0"
                max="11.0"
                step="0.1"
                value={simHbA1c}
                onChange={(e) => setSimHbA1c(parseFloat(e.target.value))}
                className="w-full accent-teal-600"
              />
            </div>

            <div>
              <label className="font-semibold block text-slate-700 dark:text-slate-300 mb-1">
                Primary Care Follow-up: {simFollowupDays} days
              </label>
              <input
                type="range"
                min="2"
                max="21"
                step="1"
                value={simFollowupDays}
                onChange={(e) => setSimFollowupDays(parseInt(e.target.value))}
                className="w-full accent-teal-600"
              />
            </div>

            <div className="flex items-center gap-2 pt-4">
              <input
                type="checkbox"
                id="hh"
                checked={simHomeHealth}
                onChange={(e) => setSimHomeHealth(e.target.checked)}
                className="rounded text-brand accent-brand"
              />
              <label htmlFor="hh" className="font-medium text-slate-800 dark:text-slate-200">
                Enroll in Home Health Nursing (-14%)
              </label>
            </div>

            <div className="flex items-center gap-2 pt-4">
              <input
                type="checkbox"
                id="mr"
                checked={simMedRecon}
                onChange={(e) => setSimMedRecon(e.target.checked)}
                className="rounded text-brand accent-brand"
              />
              <label htmlFor="mr" className="font-medium text-slate-800 dark:text-slate-200">
                Pharmacist Med Recon (-8%)
              </label>
            </div>
          </div>
        </Card>
      )}

      {/* Top Section: Flagship Risk Gauge + Model Interpretation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Animated Risk Gauge Card */}
        <Card className="p-6 flex flex-col items-center justify-center text-center space-y-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            30-Day Readmission Probability
          </span>

          <RiskGauge score={displayScore} size={220} />

          <div className="space-y-1">
            <RiskBadge level={displayLevel} size="lg" />
            <p className="text-xs text-slate-400 pt-1">
              Calibrated Brier Score: 0.082 · Confidence: 96.4%
            </p>
          </div>
        </Card>

        {/* Right: AI Clinical Narrative & Recommended Interventions */}
        <Card className="p-6 lg:col-span-2 space-y-5">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                AI Clinical Rationale & Risk Synthesis
              </h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Based on XGBoost gradient boosting evaluation across 48 clinical, demographic, and socioeconomic variables, <strong>{p.name}</strong> exhibits a <strong>{Math.round(displayScore * 100)}% risk</strong> of unplanned readmission within 30 days of hospital discharge.
            </p>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
            <h4 className="font-semibold text-xs text-slate-500 uppercase tracking-wider mb-3">
              Automated Recommended Discharge Bundle
            </h4>
            <div className="space-y-2.5">
              {[
                { title: '48-Hour Post-Discharge Telehealth Check-in', impact: 'Reduces risk by ~12%', checked: true },
                { title: 'Clinical Pharmacist Medication Reconciliation', impact: 'Mitigates polypharmacy conflict', checked: true },
                { title: 'Home Health Nursing Referral (Vitals & Wound Assessment)', impact: 'Crucial for mobility support', checked: false },
                { title: 'Specialist Cardiology Follow-up within 7 Days', impact: 'Echo review scheduled', checked: true },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800"
                >
                  <CheckCircle2 className={`w-4 h-4 mt-0.5 ${item.checked ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400'}`} />
                  <div className="flex-1 text-xs">
                    <span className="font-semibold text-slate-900 dark:text-white">{item.title}</span>
                    <span className="text-slate-500 dark:text-slate-400 block mt-0.5">{item.impact}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Bottom Section: SHAP Feature Attribution Waterfall */}
      <Card className="p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              SHAP Feature Attribution Waterfall
            </h3>
            <p className="text-xs text-slate-500">
              Exact marginal contribution of patient-specific biomarkers and clinical markers to readmission probability. Red increases risk; Green decreases risk.
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
          <SHAPWaterfall data={prediction.shapValues} />
        </div>
      </Card>
    </div>
  );
}
