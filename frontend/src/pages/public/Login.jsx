import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  HeartPulse,
  Lock,
  Mail,
  ArrowRight,
  Stethoscope,
  User,
  Shield,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function Login() {
  const { login, demoLogin, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('doctor@readmitiq.io');
  const [password, setPassword] = useState('Doctor@123');
  const [error, setError] = useState('');



  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const user = await login(email, password);
      const destination = location.state?.from?.pathname || (
        user.role === 'patient' ? '/patient/dashboard' : user.role === 'admin' ? '/admin/dashboard' : '/doctor/dashboard'
      );
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Login failed');
    }
  };

  const handleDemo = async (targetRole) => {
    setError('');
    try {
      const user = await demoLogin(targetRole);
      const destination = location.state?.from?.pathname || (
        user.role === 'patient' ? '/patient/dashboard' : user.role === 'admin' ? '/admin/dashboard' : '/doctor/dashboard'
      );
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Demo login failed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Left decorative branding panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-slate-950 to-teal-950/40 p-12 flex-col justify-between border-r border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-teal-300 flex items-center justify-center shadow-lg shadow-teal-500/20">
            <HeartPulse className="w-6 h-6 text-slate-950 font-bold" />
          </div>
          <span className="font-bold text-xl text-white tracking-wide">
            ReAdmit<span className="text-teal-400">IQ</span>
          </span>
        </div>

        <div className="space-y-6 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-950/80 border border-teal-800/80 text-teal-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Physician-validated ML Risk Stratification</span>
          </div>
          <h2 className="text-3xl font-extrabold text-white leading-tight">
            Next-generation clinical decision support for acute & post-acute care
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Access calibrated 30-day readmission risk curves, personalized SHAP feature breakdowns, and automated discharge bundles for your patients.
          </p>
        </div>

        <div className="text-xs text-slate-400 flex items-center gap-4">
          <span>HIPAA & SOC-2 Type II Certified</span>
          <span>•</span>
          <span>HL7 FHIR R4 Ready</span>
        </div>
      </div>

      {/* Right Login Form panel */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-16 py-12">
        <div className="max-w-md w-full mx-auto space-y-8">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Sign in to your portal
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Select your role or click a demo persona for immediate 1-click access.
            </p>
          </div>

          {/* Quick Demo Access Badges */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-teal-400">
              ⚡ Instant Evaluator Demo Access
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleDemo('doctor')}
                className="flex flex-col items-center gap-1 p-2.5 rounded-lg bg-slate-800/80 hover:bg-teal-950/80 hover:border-teal-700/80 border border-slate-700/60 text-slate-200 transition-all text-center group"
              >
                <Stethoscope className="w-4 h-4 text-teal-400 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold">Physician</span>
                <span className="text-[9px] text-slate-400">Dr. Chen</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemo('patient')}
                className="flex flex-col items-center gap-1 p-2.5 rounded-lg bg-slate-800/80 hover:bg-teal-950/80 hover:border-teal-700/80 border border-slate-700/60 text-slate-200 transition-all text-center group"
              >
                <User className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold">Patient</span>
                <span className="text-[9px] text-slate-400">J. Wilson</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemo('admin')}
                className="flex flex-col items-center gap-1 p-2.5 rounded-lg bg-slate-800/80 hover:bg-teal-950/80 hover:border-teal-700/80 border border-slate-700/60 text-slate-200 transition-all text-center group"
              >
                <Shield className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold">Executive</span>
                <span className="text-[9px] text-slate-400">M. Torres</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-xs font-semibold text-red-200 bg-red-950/50 border border-red-900/50 rounded-lg">
                {error}
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Hospital Email / Provider ID
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-900 border border-slate-800 rounded-lg text-white focus:border-teal-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-900 border border-slate-800 rounded-lg text-white focus:border-teal-500 outline-none"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={isLoading}
              className="w-full text-sm font-semibold justify-center shadow-lg shadow-teal-500/20"
            >
              Sign In to ReAdmitIQ
            </Button>
          </form>

          <div className="text-center text-xs text-slate-500">
            <span>Decision support software. Requires authorized hospital credentials.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
