import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  ClipboardList,
  Activity,
  Heart,
  UserCheck,
  CheckCircle,
  Stethoscope,
} from 'lucide-react';
import PageHeader from '../../components/shared/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { fetchPatient, runAssessment } from '../../api/endpoints';

const PRIMARY_CONDITIONS = [
  'Diabetes',
  'Hypertension',
  'Asthma',
  'Cancer',
  'Obesity',
  'Arthritis',
];
const ADMISSION_TYPES = ['Elective', 'Emergency', 'Urgent'];
const TEST_RESULTS = ['Normal', 'Abnormal', 'Inconclusive'];

export default function NewAssessment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [loadingPatient, setLoadingPatient] = useState(false);

  const [formData, setFormData] = useState({
    patient_name: '',
    mrn: '',
    age: 65,
    gender: 'Female',
    primary_condition: 'Diabetes',
    admission_type: 'Elective',
    length_of_stay: 4,
    test_result: 'Normal',
    medication: 'Aspirin',
    billing_amount: 10000,
    prior_admission_count: 1,
    days_since_last_discharge: 30,
    followup_scheduled: false,
  });

  useEffect(() => {
    if (id && id !== 'new') {
      setLoadingPatient(true);
      fetchPatient(id)
        .then((p) => {
          if (p) {
            setFormData((prev) => ({
              ...prev,
              patient_name: p.name || p.full_name || '',
              mrn: p.mrn || '',
              age: p.age || 65,
              gender: p.gender || 'Female',
              primary_condition: p.primaryDiagnosis || p.primary_condition || 'Diabetes',
            }));
          }
        })
        .finally(() => setLoadingPatient(false));
    }
  }, [id]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const pred = await runAssessment(id || 'new', formData);
      if (pred?.id) {
        navigate(`/doctor/predictions/${pred.id}`);
      } else {
        navigate(`/doctor/patients/${id}`);
      }
    } catch (err) {
      console.error('Failed to run assessment:', err);
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
          {/* Main Form Inputs */}
          <Card className="p-6 lg:col-span-2 space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                Patient Demographics & Admission Profile
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
                  placeholder="Patient Name"
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
                  placeholder="MRN-XXXXXX"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Age (Years)
                </label>
                <input
                  type="number"
                  min="0"
                  max="120"
                  value={formData.age}
                  onChange={(e) => handleChange('age', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Primary Condition
                </label>
                <select
                  value={formData.primary_condition}
                  onChange={(e) => handleChange('primary_condition', e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                >
                  {PRIMARY_CONDITIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-5 space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                Clinical Markers & Admission Parameters
              </h3>
              <p className="text-xs text-slate-500 mb-4">Features weighted in calibrated Random Forest + TreeSHAP pipeline</p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Admission Type
                  </label>
                  <select
                    value={formData.admission_type}
                    onChange={(e) => handleChange('admission_type', e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  >
                    {ADMISSION_TYPES.map((at) => (
                      <option key={at} value={at}>
                        {at}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Length of Stay (Days)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="365"
                    value={formData.length_of_stay}
                    onChange={(e) => handleChange('length_of_stay', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Lab Test Result
                  </label>
                  <select
                    value={formData.test_result}
                    onChange={(e) => handleChange('test_result', e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  >
                    {TEST_RESULTS.map((tr) => (
                      <option key={tr} value={tr}>
                        {tr}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Prior Admission Count
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.prior_admission_count}
                    onChange={(e) => handleChange('prior_admission_count', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Days Since Last Discharge
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.days_since_last_discharge}
                    onChange={(e) => handleChange('days_since_last_discharge', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Estimated Billing ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={formData.billing_amount}
                    onChange={(e) => handleChange('billing_amount', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-5">
              <div className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  id="assess-followup"
                  checked={formData.followup_scheduled}
                  onChange={(e) => handleChange('followup_scheduled', e.target.checked)}
                  className="accent-brand rounded w-4 h-4"
                />
                <label htmlFor="assess-followup" className="text-slate-800 dark:text-slate-200 font-medium">
                  Follow-up Appointment Confirmed
                </label>
              </div>
            </div>
          </Card>

          {/* Right Action Box */}
          <Card className="p-6 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-brand font-bold text-sm">
                <Sparkles className="w-5 h-5" />
                <span>Production ML Pipeline</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Submitting this payload will trigger feature orchestration through our Random Forest + TreeSHAP pipeline.
              </p>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Pipeline Model:</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">readmitiq-rf-v1</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">SHAP Waterfall:</span>
                  <span className="text-emerald-500 font-semibold">Active</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Rule Engine:</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">v1.0.0</span>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={submitting}
              className="w-full gap-2 text-sm justify-center shadow-lg shadow-brand/20"
            >
              <span>Compute Risk & Generate SHAP</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Card>
        </div>
      </form>
    </div>
  );
}
