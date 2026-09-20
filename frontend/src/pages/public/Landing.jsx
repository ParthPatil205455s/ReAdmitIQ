import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HeartPulse,
  ShieldCheck,
  Activity,
  BrainCircuit,
  ArrowRight,
  TrendingDown,
  Users,
  CheckCircle2,
  Stethoscope,
  Building2,
  Lock,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';

export default function Landing() {
  const { demoLogin } = useAuth();
  const navigate = useNavigate();

  const handleLaunchDemo = async (role = 'doctor') => {
    await demoLogin(role);
    if (role === 'patient') navigate('/patient/dashboard');
    else if (role === 'admin') navigate('/admin/dashboard');
    else navigate('/doctor/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-teal-500 selection:text-white">
      {/* Navbar */}
      <nav className="border-b border-slate-800/80 backdrop-blur-md sticky top-0 z-50 bg-slate-950/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-teal-300 flex items-center justify-center shadow-lg shadow-teal-500/20">
              <HeartPulse className="w-6 h-6 text-slate-950 font-bold" />
            </div>
            <div>
              <span className="font-bold text-lg text-white tracking-wide flex items-center gap-2">
                ReAdmit<span className="text-teal-400">IQ</span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-800">
                  v2.4
                </span>
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-teal-400 transition-colors">Features</a>
            <a href="#workflow" className="hover:text-teal-400 transition-colors">Clinical Workflow</a>
            <a href="#metrics" className="hover:text-teal-400 transition-colors">Model Metrics</a>
            <Link to="/model-card" className="hover:text-teal-400 transition-colors">AI Transparency</Link>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/login">
              <button className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors">
                Sign In
              </button>
            </Link>
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleLaunchDemo('doctor')}
              className="hidden sm:inline-flex"
            >
              Launch Live Demo
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(15,118,110,0.3),rgba(255,255,255,0))]" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-950/80 border border-teal-700/60 text-teal-300 text-xs font-semibold mb-6 animate-fadeIn">
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            <span>XGBoost + SHAP Explainable Clinical Decision Engine</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
            Prevent Hospital Readmissions with{' '}
            <span className="bg-gradient-to-r from-teal-400 via-emerald-300 to-indigo-400 bg-clip-text text-transparent">
              Explainable AI
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            ReAdmitIQ empowers physicians and care teams to predict 30-day post-discharge readmission risks in real-time, backed by patient-specific SHAP factor attribution and automated care protocols.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              variant="primary"
              onClick={() => handleLaunchDemo('doctor')}
              className="w-full sm:w-auto text-base gap-2 shadow-xl shadow-teal-500/20"
            >
              <span>Launch Physician Portal</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
            <div className="flex gap-2">
              <Button
                size="lg"
                variant="secondary"
                onClick={() => handleLaunchDemo('patient')}
                className="text-sm bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700"
              >
                Patient View
              </Button>
              <Button
                size="lg"
                variant="secondary"
                onClick={() => handleLaunchDemo('admin')}
                className="text-sm bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700"
              >
                Admin View
              </Button>
            </div>
          </div>

          {/* Trust badges */}
          <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto text-xs text-slate-400">
            <div className="flex items-center justify-center gap-2 p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              <span>HIPAA & HITECH Compliant</span>
            </div>
            <div className="flex items-center justify-center gap-2 p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
              <BrainCircuit className="w-4 h-4 text-teal-400" />
              <span>94.2% ROC-AUC Accuracy</span>
            </div>
            <div className="flex items-center justify-center gap-2 p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
              <TrendingDown className="w-4 h-4 text-emerald-400" />
              <span>24.8% Readmission Reduction</span>
            </div>
            <div className="flex items-center justify-center gap-2 p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
              <Lock className="w-4 h-4 text-teal-400" />
              <span>FHIR / HL7 Interoperable</span>
            </div>
          </div>
        </div>
      </section>

      {/* Real-time KPI Preview Grid */}
      <section id="metrics" className="py-16 bg-slate-900/40 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Proven Clinical & Financial ROI</h2>
            <p className="text-sm text-slate-400 mt-2">Aggregated metrics across 12 participating regional medical centers</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-center">
              <p className="text-xs uppercase font-semibold text-slate-400">30-Day Readmission Rate</p>
              <p className="text-4xl font-mono font-bold text-teal-400 mt-2">11.8%</p>
              <p className="text-xs text-emerald-400 mt-1">↓ 4.6% vs National Benchmark</p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-center">
              <p className="text-xs uppercase font-semibold text-slate-400">CMS Penalty Avoidance</p>
              <p className="text-4xl font-mono font-bold text-emerald-400 mt-2">$2.4M</p>
              <p className="text-xs text-slate-400 mt-1">Cumulative FY savings</p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-center">
              <p className="text-xs uppercase font-semibold text-slate-400">Model Inference Latency</p>
              <p className="text-4xl font-mono font-bold text-indigo-400 mt-2">42ms</p>
              <p className="text-xs text-slate-400 mt-1">Real-time EHR bedside scoring</p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-center">
              <p className="text-xs uppercase font-semibold text-slate-400">Physician Agreement</p>
              <p className="text-4xl font-mono font-bold text-teal-300 mt-2">91.4%</p>
              <p className="text-xs text-emerald-400 mt-1">SHAP rationale clinical concordance</p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs uppercase font-mono tracking-widest text-teal-400 font-semibold">Engine Architecture</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mt-2">Engineered for Clinical Trust</h2>
            <p className="text-slate-400 mt-3 text-sm sm:text-base">
              Unlike black-box algorithms, ReAdmitIQ demystifies clinical risk with actionable, local explanations physicians can verify in seconds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-teal-500/50 transition-all">
              <div className="w-12 h-12 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center mb-4">
                <BrainCircuit className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">XGBoost & SHAP Waterfall</h3>
              <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                Breakdown each risk score into clear positive and negative contributors — e.g. HbA1c elevation, polypharmacy, mobility limitations.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-teal-500/50 transition-all">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Interactive What-If Simulation</h3>
              <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                Simulate targeted interventions (e.g. home health visits, medication reconciliation) and view instant recalculated readmission probabilities.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-teal-500/50 transition-all">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Tri-Role Care Coordination</h3>
              <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                Dedicated interfaces for Attending Physicians, Discharged Patients, and Health System Executives with real-time sync and audit trails.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-950 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <HeartPulse className="w-4 h-4 text-teal-400" />
            <span>ReAdmitIQ Clinical Decision Support Platform · Decision support only. Not an autonomous diagnostic tool.</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-slate-400">
            <Link to="/model-card" className="hover:text-teal-400 transition-colors">Model Transparency Card</Link>
            <Link to="/login" className="hover:text-teal-400 transition-colors">Clinician Portal</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
