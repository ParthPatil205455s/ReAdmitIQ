import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  ClipboardList,
  Activity,
  Heart,
  UserCheck,
  CheckCircle,
} from 'lucide-react';
import PageHeader from '../../components/shared/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { runAssessment } from '../../api/endpoints';

export default function NewAssessment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    patient_name: 'Eleanor Vance',
    mrn: 'MRN-847291',
    age: 72,
    gender: 'Female',
    diagnosis: 'Congestive Heart Failure (NYHA Class III)',
    length_of_stay: 5,
    systolic_bp: 142,
    diastolic_bp: 88,
    heart_rate: 84,
    spo2: 95,
    hba1c: 8.6,
    creatinine: 1.4,
    prior_admissions: 2,
    active_meds_count: 9,
    lives_alone: true,
    has_home_support: false,
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const pred = await runAssessment(id || 'new', formData);
      // Navigate to prediction result
      navigate(`/doctor/predictions/${pred.id}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Run Inpatient Clinical AI Assessment"
        subtitle="Submit updated vitals and clinical determinants for calibrated 30-day readmission prediction"
        breadcrumbs={[
          { label: 'Doctor Portal', href: '/doctor/dashboard' },
          { label: 'Assessments' },
          { label: 'New Risk Inference' },
        ]}
      />

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Clinical Data Input Form */}
          <Card className="p-6 lg:col-span-2 space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                Patient Demographics & Primary Admission
              </h3>
              <p className="text-xs text-slate-500">Essential identifiers for EHR record synchronization</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Patient Full Name
                </label>
                <input
                  type="text"
                  value={formData.patient_name}
                  onChange={(e) => handleChange('patient_name', e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Medical Record Number (MRN)
                </label>
                <input
                  type="text"
                  value={formData.mrn}
                  onChange={(e) => handleChange('mrn', e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Age (Years)
                </label>
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => handleChange('age', parseInt(e.target.value))}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Length of Current Stay (Days)
                </label>
                <input
                  type="number"
                  value={formData.length_of_stay}
                  onChange={(e) => handleChange('length_of_stay', parseInt(e.target.value))}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  required
                />
              </div>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-5">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                Vital Signs & Critical Biomarkers
              </h3>
              <p className="text-xs text-slate-500 mb-4">Laboratory assays heavily weighted in XGBoost feature nodes</p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Systolic BP
                  </label>
                  <input
                    type="number"
                    value={formData.systolic_bp}
                    onChange={(e) => handleChange('systolic_bp', parseInt(e.target.value))}
                    className="w-full px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Heart Rate (BPM)
                  </label>
                  <input
                    type="number"
                    value={formData.heart_rate}
                    onChange={(e) => handleChange('heart_rate', parseInt(e.target.value))}
                    className="w-full px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    HbA1c (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.hba1c}
                    onChange={(e) => handleChange('hba1c', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Serum Creatinine
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.creatinine}
                    onChange={(e) => handleChange('creatinine', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-5">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                Social Determinants & Prior History (SDOH)
              </h3>
              <p className="text-xs text-slate-500 mb-4">Post-discharge environment & utilization risk factors</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="flex items-center gap-2 p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                  <input
                    type="checkbox"
                    id="alone"
                    checked={formData.lives_alone}
                    onChange={(e) => handleChange('lives_alone', e.target.checked)}
                    className="accent-teal-600 rounded"
                  />
                  <label htmlFor="alone" className="text-slate-800 dark:text-slate-200 font-medium">
                    Patient Lives Alone
                  </label>
                </div>

                <div className="flex items-center gap-2 p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                  <input
                    type="checkbox"
                    id="support"
                    checked={formData.has_home_support}
                    onChange={(e) => handleChange('has_home_support', e.target.checked)}
                    className="accent-teal-600 rounded"
                  />
                  <label htmlFor="support" className="text-slate-800 dark:text-slate-200 font-medium">
                    Has Designated Primary Caregiver
                  </label>
                </div>
              </div>
            </div>
          </Card>

          {/* Right Summary & Submit Card */}
          <Card className="p-6 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400 font-bold text-sm">
                <Sparkles className="w-5 h-5" />
                <span>Model Pipeline Status</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                When you click "Compute Risk Score", this clinical payload will be processed by our calibrated XGBoost v2.4 model.
              </p>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Pipeline Latency:</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">~42ms</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">SHAP Explanations:</span>
                  <span className="text-emerald-500 font-semibold">Enabled</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">CMS Risk Model:</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">HWR v12.1</span>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={submitting}
              className="w-full gap-2 text-sm justify-center shadow-lg shadow-teal-500/20"
            >
              <span>Compute Risk & SHAP Waterfall</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Card>
        </div>
      </form>
    </div>
  );
}
