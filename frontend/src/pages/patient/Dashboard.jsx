import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart,
  Calendar,
  Pill,
  CheckCircle2,
  Clock,
  PhoneCall,
  Activity,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import PageHeader from '../../components/shared/PageHeader';
import RiskBadge from '../../components/shared/RiskBadge';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import ProgressBar from '../../components/ui/ProgressBar';
import { useAuth } from '../../contexts/AuthContext';
import { carePlanItems, appointments } from '../../data/mockData';

export default function PatientDashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState(carePlanItems);

  const completedCount = tasks.filter((t) => t.completed).length;
  const progressPct = Math.round((completedCount / tasks.length) * 100);

  const toggleTask = (id) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-teal-700 to-teal-900 text-white p-6 sm:p-8 shadow-lg relative overflow-hidden">
        <div className="max-w-2xl relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs text-teal-100 text-xs font-semibold">
            <Heart className="w-3.5 h-3.5 text-teal-300" />
            <span>Post-Discharge Recovery Program</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name || 'James Wilson'}
          </h1>
          <p className="text-teal-100 text-xs sm:text-sm leading-relaxed">
            You are currently on Day 6 of your 30-day home recovery window. Your dedicated care team is tracking your recovery milestones to ensure you stay healthy at home.
          </p>
        </div>
      </div>

      {/* Grid: Risk Status + Care Plan Progress + Next Appointment */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Risk Status */}
        <Card className="p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Recovery Status
              </span>
              <RiskBadge level="medium" size="sm" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-2">
              Moderate Risk
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Your recovery is on track! Following your daily medication schedule and weighing yourself each morning helps prevent readmission.
            </p>
          </div>
          <Link to="/patient/risk">
            <Button variant="secondary" size="sm" className="w-full gap-1.5 justify-center">
              <span>Learn About My Risk</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </Card>

        {/* Daily Care Plan Progress */}
        <Card className="p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Care Plan Tasks
              </span>
              <span className="font-mono text-xs font-bold text-teal-600 dark:text-teal-400">
                {completedCount} of {tasks.length} done
              </span>
            </div>
            <div className="mt-3">
              <ProgressBar value={progressPct} showLabel={false} />
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Complete your daily tasks to keep your doctor updated on your progress.
            </p>
          </div>
          <Link to="/patient/care-plan">
            <Button variant="secondary" size="sm" className="w-full gap-1.5 justify-center">
              <span>View Full Care Plan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </Card>

        {/* Urgent Care Team Line */}
        <Card className="p-5 flex flex-col justify-between space-y-4 bg-teal-50/50 dark:bg-teal-950/20 border-teal-200 dark:border-teal-800">
          <div>
            <div className="flex items-center gap-2 text-teal-700 dark:text-teal-300 font-bold text-sm">
              <PhoneCall className="w-4 h-4" />
              <span>Care Navigator Support</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
              Feeling shortness of breath or sudden weight gain greater than 3 lbs in 2 days? Call your care coordinator immediately.
            </p>
          </div>
          <a href="tel:5550192834" className="w-full">
            <Button variant="primary" size="sm" className="w-full justify-center">
              Call Care Team (24/7)
            </Button>
          </a>
        </Card>
      </div>

      {/* Active Tasks & Upcoming Visits */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Tasks */}
        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Today's Recovery Checklist
            </h3>
            <span className="text-xs text-slate-400">Check off as you complete</span>
          </div>

          <div className="space-y-2.5">
            {tasks.map((task) => (
              <div
                key={task.id}
                onClick={() => toggleTask(task.id)}
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  task.completed
                    ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 text-slate-500 line-through'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-teal-500'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                      task.completed
                        ? 'bg-teal-600 border-teal-600 text-white'
                        : 'border-slate-300 dark:border-slate-600'
                    }`}
                  >
                    {task.completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </div>
                  <span className="text-xs font-semibold">{task.title}</span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">{task.time}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Upcoming Appointments */}
        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Scheduled Follow-up Visits
            </h3>
            <span className="text-xs text-slate-400">Critical for readmission safety</span>
          </div>

          <div className="space-y-3">
            {appointments.map((appt) => (
              <div
                key={appt.id}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-start gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      {appt.type}
                    </h4>
                    <span className="text-[10px] font-semibold text-teal-600 bg-teal-50 dark:bg-teal-950/40 px-2 py-0.5 rounded">
                      {appt.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                    {appt.provider} · {appt.location}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1 font-mono">
                    {appt.date} at {appt.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
