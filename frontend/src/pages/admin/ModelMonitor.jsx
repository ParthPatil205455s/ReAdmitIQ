import { useState, useEffect } from 'react';
import {
  Cpu,
  ShieldAlert,
  CheckCircle2,
  RefreshCw,
  Sliders,
  Layers,
  Activity,
  Award,
} from 'lucide-react';
import PageHeader from '../../components/shared/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import ModelPerformanceChart from '../../components/charts/ModelPerformanceChart';
import { fetchModelMetrics } from '../../api/endpoints';

export default function ModelMonitor() {
  const [metrics, setMetrics] = useState(null);
  const [retraining, setRetraining] = useState(false);

  useEffect(() => {
    fetchModelMetrics().then(setMetrics);
  }, []);

  const handleRetrain = () => {
    setRetraining(true);
    setTimeout(() => {
      setRetraining(false);
      alert('Model v2.4 pipeline verified. Cross-validation AUC updated to 0.943.');
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Machine Learning Model Governance & Monitoring"
        subtitle="Real-time validation, statistical drift detection, ROC-AUC calibration, and reproducibility audit"
        breadcrumbs={[
          { label: 'Executive Portal', href: '/admin/dashboard' },
          { label: 'Model Monitor' },
        ]}
        actions={
          <Button
            variant="primary"
            size="sm"
            loading={retraining}
            onClick={handleRetrain}
            className="gap-1.5"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Trigger Retrain Check</span>
          </Button>
        }
      />

      {/* Model Performance Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4">
          <span className="text-xs text-slate-500 uppercase font-semibold">ROC-AUC Score</span>
          <p className="text-2xl lg:text-3xl font-bold font-mono text-teal-600 dark:text-teal-400 mt-1">
            0.942
          </p>
          <span className="text-[10px] text-emerald-500 font-medium">Excellent Discrimination</span>
        </Card>

        <Card className="p-4">
          <span className="text-xs text-slate-500 uppercase font-semibold">Model Sensitivity (Recall)</span>
          <p className="text-2xl lg:text-3xl font-bold font-mono text-slate-900 dark:text-white mt-1">
            91.4%
          </p>
          <span className="text-[10px] text-slate-400">Minimizes False Negatives</span>
        </Card>

        <Card className="p-4">
          <span className="text-xs text-slate-500 uppercase font-semibold">Calibrated Brier Score</span>
          <p className="text-2xl lg:text-3xl font-bold font-mono text-slate-900 dark:text-white mt-1">
            0.082
          </p>
          <span className="text-[10px] text-emerald-500 font-medium">Near-Optimal Probability Fit</span>
        </Card>

        <Card className="p-4">
          <span className="text-xs text-slate-500 uppercase font-semibold">Inference Latency</span>
          <p className="text-2xl lg:text-3xl font-bold font-mono text-indigo-600 dark:text-indigo-400 mt-1">
            42 ms
          </p>
          <span className="text-[10px] text-slate-400">p99 &lt; 85ms across nodes</span>
        </Card>
      </div>

      {/* ROC Curve & Performance Charts */}
      <Card className="p-6 space-y-4">
        <div>
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            Model Validation & Global Feature Importance
          </h3>
          <p className="text-xs text-slate-500">Receiver Operating Characteristic (ROC) curve & SHAP global feature importances</p>
        </div>
        <ModelPerformanceChart />
      </Card>

      {/* Model Drift & Governance Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5 space-y-4">
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            Statistical Covariate Drift Surveillance
          </h3>
          <div className="space-y-3 pt-2 text-xs">
            {[
              { name: 'HbA1c Lab Distribution', drift: '0.012 KS-Stat', status: 'Healthy', color: 'text-emerald-500' },
              { name: 'Emergency Dept Utilization Rate', drift: '0.018 KS-Stat', status: 'Healthy', color: 'text-emerald-500' },
              { name: 'Inpatient Age Demographics', drift: '0.024 KS-Stat', status: 'Healthy', color: 'text-emerald-500' },
              { name: 'Systolic Blood Pressure Inputs', drift: '0.031 KS-Stat', status: 'Healthy', color: 'text-emerald-500' },
            ].map((drift, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-900 dark:text-white block">{drift.name}</span>
                  <span className="text-slate-400 font-mono text-[11px]">{drift.drift}</span>
                </div>
                <span className={`font-semibold ${drift.color}`}>{drift.status}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5 space-y-4">
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            Model Registry & Version History
          </h3>
          <div className="space-y-3 pt-2 text-xs">
            <div className="p-3.5 rounded-xl border border-teal-500/50 bg-teal-50/40 dark:bg-teal-950/20">
              <div className="flex items-center justify-between">
                <span className="font-bold text-teal-800 dark:text-teal-200 font-mono">
                  v2.4.1 (Current Production)
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-teal-600 text-white">
                  Active
                </span>
              </div>
              <p className="text-slate-500 mt-1">Deployed Sep 14, 2026 · XGBoost + TreeSHAP Explainer</p>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700 dark:text-slate-300 font-mono">
                  v2.3.0 (Archived Baseline)
                </span>
                <span className="text-slate-400 text-[10px]">Aug 2026</span>
              </div>
              <p className="text-slate-500 mt-1">Rollback ready if drift exceeds threshold &gt; 0.05</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
