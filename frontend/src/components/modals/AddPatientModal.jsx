import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, UserPlus, Sparkles, AlertCircle, CheckCircle2, Stethoscope, FileText, Heart } from 'lucide-react';
import Button from '../ui/Button';
import { createPatient } from '../../api/endpoints';

const PRIMARY_CONDITIONS = [
  'Diabetes',
  'Hypertension',
  'Asthma',
  'Cancer',
  'Obesity',
  'Arthritis',
];

const GENDERS = ['Female', 'Male', 'Other'];
const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const INSURANCE_PROVIDERS = [
  'Medicare',
  'Blue Cross',
  'Aetna',
  'Cigna',
  'UnitedHealthcare',
];
const ADMISSION_TYPES = ['Elective', 'Emergency', 'Urgent'];
const TEST_RESULTS = ['Normal', 'Abnormal', 'Inconclusive'];
const MEDICATIONS = ['Aspirin', 'Ibuprofen', 'Lipitor', 'Paracetamol', 'Penicillin'];

export default function AddPatientModal({ isOpen, onClose, onPatientCreated }) {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    full_name: '',
    mrn: '',
    age: 58,
    gender: 'Female',
    blood_type: 'O+',
    primary_condition: 'Diabetes',
    insurance_provider: 'Medicare',
    contact_email: '',
    admission_type: 'Elective',
    length_of_stay: 4,
    medication: 'Aspirin',
    test_result: 'Normal',
    billing_amount: 12500,
    hospital: 'St. Jude Medical Center',
    attending_doctor: 'Dr. Sarah Chen',
    followup_scheduled: false,
  });

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.full_name.trim() || formData.full_name.trim().length < 2) {
      errs.full_name = 'Full name must be at least 2 characters.';
    }
    if (formData.age === '' || isNaN(formData.age) || formData.age < 0 || formData.age > 120) {
      errs.age = 'Age must be a valid number between 0 and 120.';
    }
    if (!formData.primary_condition) {
      errs.primary_condition = 'Primary condition is required.';
    }
    if (formData.contact_email && !/\S+@\S+\.\S+/.test(formData.contact_email)) {
      errs.contact_email = 'Invalid email address format.';
    }
    if (formData.length_of_stay < 0 || formData.length_of_stay > 365) {
      errs.length_of_stay = 'Length of stay must be between 0 and 365 days.';
    }
    if (formData.billing_amount < 0) {
      errs.billing_amount = 'Billing amount cannot be negative.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);

    if (!validate()) return;

    setSubmitting(true);
    try {
      const newPatient = await createPatient(formData);
      if (onPatientCreated) {
        onPatientCreated(newPatient);
      }
      onClose();
      // Navigate to newly created patient's detail view
      if (newPatient?.id) {
        navigate(`/doctor/patients/${newPatient.id}`);
      }
    } catch (err) {
      console.error('Failed to create patient:', err);
      setApiError(
        err.response?.data?.detail ||
          err.message ||
          'Failed to save patient. Please verify database connection and retry.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl overflow-hidden my-8 animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center shrink-0">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Enroll New Inpatient Record
              </h3>
              <p className="text-xs text-slate-500">
                Synchronize patient demographics & initial clinical markers with ML risk engine
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {apiError && (
            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 flex items-start gap-3 text-red-700 dark:text-red-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block mb-0.5">Error Creating Patient</span>
                {apiError}
              </div>
            </div>
          )}

          {/* Section 1: Demographics */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
              <FileText className="w-4 h-4 text-brand" />
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
                1. Patient Demographics & Identity
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-semibold block text-slate-700 dark:text-slate-300 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sarah Jenkins"
                  value={formData.full_name}
                  onChange={(e) => handleChange('full_name', e.target.value)}
                  className={`w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border ${
                    errors.full_name ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
                  } rounded-lg text-slate-900 dark:text-white outline-none focus:border-brand`}
                  required
                />
                {errors.full_name && (
                  <p className="text-[11px] text-red-500 mt-1">{errors.full_name}</p>
                )}
              </div>

              <div>
                <label className="font-semibold block text-slate-700 dark:text-slate-300 mb-1">
                  MRN (Medical Record #) <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="Auto-generated if empty"
                  value={formData.mrn}
                  onChange={(e) => handleChange('mrn', e.target.value)}
                  className="w-full px-3 py-2 font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white outline-none focus:border-brand"
                />
              </div>

              <div>
                <label className="font-semibold block text-slate-700 dark:text-slate-300 mb-1">
                  Age (Years) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  max="120"
                  value={formData.age}
                  onChange={(e) => handleChange('age', e.target.value === '' ? '' : parseInt(e.target.value))}
                  className={`w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border ${
                    errors.age ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
                  } rounded-lg text-slate-900 dark:text-white outline-none focus:border-brand`}
                  required
                />
                {errors.age && <p className="text-[11px] text-red-500 mt-1">{errors.age}</p>}
              </div>

              <div>
                <label className="font-semibold block text-slate-700 dark:text-slate-300 mb-1">
                  Gender <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => handleChange('gender', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white outline-none focus:border-brand"
                >
                  {GENDERS.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold block text-slate-700 dark:text-slate-300 mb-1">
                  Blood Type
                </label>
                <select
                  value={formData.blood_type}
                  onChange={(e) => handleChange('blood_type', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white outline-none focus:border-brand"
                >
                  {BLOOD_TYPES.map((bt) => (
                    <option key={bt} value={bt}>
                      {bt}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold block text-slate-700 dark:text-slate-300 mb-1">
                  Primary Condition / Diagnosis <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.primary_condition}
                  onChange={(e) => handleChange('primary_condition', e.target.value)}
                  className={`w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border ${
                    errors.primary_condition ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
                  } rounded-lg text-slate-900 dark:text-white outline-none focus:border-brand`}
                  required
                >
                  {PRIMARY_CONDITIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                {errors.primary_condition && (
                  <p className="text-[11px] text-red-500 mt-1">{errors.primary_condition}</p>
                )}
              </div>

              <div>
                <label className="font-semibold block text-slate-700 dark:text-slate-300 mb-1">
                  Insurance Provider
                </label>
                <select
                  value={formData.insurance_provider}
                  onChange={(e) => handleChange('insurance_provider', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white outline-none focus:border-brand"
                >
                  {INSURANCE_PROVIDERS.map((ip) => (
                    <option key={ip} value={ip}>
                      {ip}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold block text-slate-700 dark:text-slate-300 mb-1">
                  Contact Email <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="email"
                  placeholder="patient@example.com"
                  value={formData.contact_email}
                  onChange={(e) => handleChange('contact_email', e.target.value)}
                  className={`w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border ${
                    errors.contact_email ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
                  } rounded-lg text-slate-900 dark:text-white outline-none focus:border-brand`}
                />
                {errors.contact_email && (
                  <p className="text-[11px] text-red-500 mt-1">{errors.contact_email}</p>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Clinical Factors for Initial ML Assessment */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
              <Stethoscope className="w-4 h-4 text-brand" />
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
                2. Initial Admission & ML Feature Parameters
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="font-semibold block text-slate-700 dark:text-slate-300 mb-1">
                  Admission Type
                </label>
                <select
                  value={formData.admission_type}
                  onChange={(e) => handleChange('admission_type', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white outline-none focus:border-brand"
                >
                  {ADMISSION_TYPES.map((at) => (
                    <option key={at} value={at}>
                      {at}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold block text-slate-700 dark:text-slate-300 mb-1">
                  Length of Stay (Days)
                </label>
                <input
                  type="number"
                  min="0"
                  max="365"
                  value={formData.length_of_stay}
                  onChange={(e) => handleChange('length_of_stay', e.target.value === '' ? 0 : parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white outline-none focus:border-brand"
                />
              </div>

              <div>
                <label className="font-semibold block text-slate-700 dark:text-slate-300 mb-1">
                  Lab Test Result
                </label>
                <select
                  value={formData.test_result}
                  onChange={(e) => handleChange('test_result', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white outline-none focus:border-brand"
                >
                  {TEST_RESULTS.map((tr) => (
                    <option key={tr} value={tr}>
                      {tr}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold block text-slate-700 dark:text-slate-300 mb-1">
                  Primary Medication
                </label>
                <select
                  value={formData.medication}
                  onChange={(e) => handleChange('medication', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white outline-none focus:border-brand"
                >
                  {MEDICATIONS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold block text-slate-700 dark:text-slate-300 mb-1">
                  Billing Amount ($)
                </label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={formData.billing_amount}
                  onChange={(e) => handleChange('billing_amount', e.target.value === '' ? 0 : parseFloat(e.target.value))}
                  className="w-full px-3 py-2 font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white outline-none focus:border-brand"
                />
              </div>

              <div className="flex items-center gap-2 pt-5">
                <input
                  type="checkbox"
                  id="modal-followup"
                  checked={formData.followup_scheduled}
                  onChange={(e) => handleChange('followup_scheduled', e.target.checked)}
                  className="accent-brand rounded w-4 h-4"
                />
                <label htmlFor="modal-followup" className="font-medium text-slate-800 dark:text-slate-200">
                  Follow-up Visit Scheduled
                </label>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <Button variant="secondary" type="button" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              loading={submitting}
              className="gap-2 shadow-md shadow-brand/20"
            >
              <Sparkles className="w-4 h-4" />
              <span>Save Patient & Compute Risk</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
