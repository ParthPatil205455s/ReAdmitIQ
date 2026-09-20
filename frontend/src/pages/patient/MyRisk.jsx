import {
  ShieldCheck,
  Heart,
  AlertTriangle,
  CheckCircle2,
  PhoneCall,
  Activity,
  Pill,
} from 'lucide-react';
import PageHeader from '../../components/shared/PageHeader';
import RiskBadge from '../../components/shared/RiskBadge';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

export default function MyRisk() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Understanding Your Readmission Risk"
        subtitle="Empowering you with personalized insights from your clinical care team"
        breadcrumbs={[
          { label: 'Patient Portal', href: '/patient/dashboard' },
          { label: 'My Readmission Risk' },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Overview Card */}
        <Card className="p-6 text-center flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <Activity className="w-8 h-8" />
          </div>

          <div>
            <span className="text-xs uppercase font-semibold text-slate-400">Current Assessment</span>
            <div className="my-2">
              <RiskBadge level="medium" size="lg" />
            </div>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Your hospital care team calculated this score before discharge to ensure you receive extra support at home.
            </p>
          </div>
        </Card>

        {/* What This Means for You */}
        <Card className="p-6 lg:col-span-2 space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            What Does "Moderate Risk" Mean?
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Many patients recovering from heart conditions or complex medication changes require extra vigilance in the first 30 days after leaving the hospital. Moderate risk means that with simple daily routines — taking medicines on time, monitoring your weight, and attending follow-up visits — you have a very strong likelihood of a full, smooth recovery at home.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <h4 className="font-semibold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-teal-600" />
                <span>Things in Your Control</span>
              </h4>
              <ul className="text-xs text-slate-500 mt-2 space-y-1 list-disc list-inside">
                <li>Take blood pressure medicine daily</li>
                <li>Weigh yourself every morning</li>
                <li>Stay under 2,000mg sodium daily</li>
              </ul>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <h4 className="font-semibold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>When to Call Immediately</span>
              </h4>
              <ul className="text-xs text-slate-500 mt-2 space-y-1 list-disc list-inside">
                <li>Sudden gain of 3+ lbs in 2 days</li>
                <li>Swelling in ankles or legs</li>
                <li>New or worsening shortness of breath</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>

      {/* Action Banner */}
      <Card className="p-6 bg-teal-50 dark:bg-teal-950/30 border-teal-200 dark:border-teal-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
            <PhoneCall className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">
              Questions About Your Recovery Plan?
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Nurse Navigator Sarah is on call today for your care team.
            </p>
          </div>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => alert('Dialing your Care Navigation Hotline (555-019-2834)...')}
          className="shrink-0"
        >
          Call Care Navigator
        </Button>
      </Card>
    </div>
  );
}
