import {
  ShieldCheck,
  BrainCircuit,
  Database,
  Award,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Lock,
} from 'lucide-react';
import PageHeader from '../../components/shared/PageHeader';
import Card from '../../components/ui/Card';

export default function ModelCard() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <PageHeader
        title="ReAdmitIQ AI Model Transparency Card"
        subtitle="Formal ML documentation per IEEE/ACM AI ethics and FDA SaMD clinical evaluation standards"
      />

      {/* Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-5 space-y-2">
          <span className="text-xs uppercase font-semibold text-slate-500">Model Architecture</span>
          <p className="text-lg font-bold text-slate-900 dark:text-white">XGBoost v2.4 + TreeSHAP</p>
          <p className="text-xs text-slate-500">Gradient boosted decision trees with exact local game-theoretic attribution</p>
        </Card>

        <Card className="p-5 space-y-2">
          <span className="text-xs uppercase font-semibold text-slate-500">Training Dataset</span>
          <p className="text-lg font-bold text-slate-900 dark:text-white">MIMIC-IV + Optum EHR</p>
          <p className="text-xs text-slate-500">148,000 multi-center inpatient admissions across 7 health networks</p>
        </Card>

        <Card className="p-5 space-y-2">
          <span className="text-xs uppercase font-semibold text-slate-500">Validation Performance</span>
          <p className="text-lg font-bold text-teal-600 dark:text-teal-400 font-mono">0.942 ROC-AUC</p>
          <p className="text-xs text-slate-500">Validated against prospective 30-day post-discharge outcomes</p>
        </Card>
      </div>

      {/* Intended Use & Clinical Scope */}
      <Card className="p-6 space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <BrainCircuit className="w-5 h-5 text-teal-600 dark:text-teal-400" />
          <span>Intended Clinical Use & Indication</span>
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          ReAdmitIQ is a Clinical Decision Support (CDS) software system intended for use by licensed healthcare professionals to estimate the risk of unplanned 30-day all-cause hospital readmission among adult inpatients prior to discharge. It is designed to assist care teams in allocating post-discharge interventions such as nurse home visits, medication reconciliation, and early follow-up appointments.
        </p>

        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-800 dark:text-amber-200 space-y-1">
          <div className="flex items-center gap-2 font-bold">
            <AlertTriangle className="w-4 h-4" />
            <span>Non-Autonomous Decision Support Notice</span>
          </div>
          <p>
            ReAdmitIQ does not diagnose conditions, prescribe therapeutics, or replace physician clinical judgment. All risk predictions and care plan recommendations must be verified by the attending care team.
          </p>
        </div>
      </Card>

      {/* Features & Demographic Fairness */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <span>Feature Space (48 Input Variables)</span>
          </h3>
          <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-2 list-disc list-inside">
            <li><strong>Physiological Vitals:</strong> Systolic/Diastolic BP, SpO2, Heart Rate, Respiratory Rate</li>
            <li><strong>Lab Biomarkers:</strong> HbA1c, Serum Creatinine, eGFR, BNP, Sodium, Hemoglobin</li>
            <li><strong>Utilization History:</strong> Emergency department visits within 6 months, prior 12-month inpatient admissions</li>
            <li><strong>Comorbidity Index:</strong> Charlson Comorbidity Score, Elixhauser score</li>
            <li><strong>Social Determinants (SDOH):</strong> Living alone, primary caregiver presence, transportation access</li>
          </ul>
        </Card>

        <Card className="p-6 space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <span>Demographic Parity & Bias Mitigation</span>
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            The model was evaluated for demographic parity across age, sex, and race cohorts. Calibration curves confirmed uniform Brier calibration across subgroups, ensuring predictive equity and minimizing disparities in discharge resource distribution.
          </p>
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs space-y-1 font-mono">
            <div className="flex justify-between">
              <span className="text-slate-500">Disparate Impact Ratio:</span>
              <span className="text-slate-900 dark:text-white font-bold">0.98 (Acceptable &gt; 0.80)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Equalized Odds Delta:</span>
              <span className="text-slate-900 dark:text-white font-bold">&lt; 0.02</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
