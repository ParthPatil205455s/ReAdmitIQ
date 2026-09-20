import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users,
  AlertTriangle,
  Activity,
  TrendingDown,
  Plus,
  ArrowUpRight,
  Filter,
  Search,
  CheckCircle2,
} from 'lucide-react';
import PageHeader from '../../components/shared/PageHeader';
import KPICard from '../../components/shared/KPICard';
import RiskBadge from '../../components/shared/RiskBadge';
import Timeline from '../../components/shared/Timeline';
import RiskDistribution from '../../components/charts/RiskDistribution';
import TrendChart from '../../components/charts/TrendChart';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import {
  fetchKPIStats,
  fetchPatients,
  fetchRecentActivity,
  fetchRiskDistribution,
  fetchTrendData,
} from '../../api/endpoints';

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [kpis, setKpis] = useState(null);
  const [riskDist, setRiskDist] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [pts, kpiData, dist, trends, acts] = await Promise.all([
          fetchPatients(),
          fetchKPIStats(),
          fetchRiskDistribution(),
          fetchTrendData(),
          fetchRecentActivity(),
        ]);
        setPatients(pts || []);
        setKpis(kpiData);
        setRiskDist(dist || []);
        setTrendData(trends || []);
        setActivities(acts || []);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const highRiskPatients = patients.filter((p) => p.riskLevel === 'high' || p.riskLevel === 'critical');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Physician Clinical Workstation"
        subtitle="Real-time 30-day readmission risk stratification and explainable ML insights"
        actions={
          <div className="flex items-center gap-2">
            <Link to="/doctor/patients">
              <Button variant="secondary" size="sm">
                View All Patients
              </Button>
            </Link>
            <Link to="/doctor/assess/new">
              <Button variant="primary" size="sm" className="gap-1.5">
                <Plus className="w-4 h-4" />
                <span>New Assessment</span>
              </Button>
            </Link>
          </div>
        }
      />

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Monitored Inpatients"
          value={kpis?.totalPatients?.value || '248'}
          change={kpis?.totalPatients?.change || '+12%'}
          trend={kpis?.totalPatients?.trend || 'up'}
          icon={Users}
          color="brand"
          subtext="Active inpatient census"
        />
        <KPICard
          title="High Risk Readmissions"
          value={kpis?.highRiskPatients?.value || '38'}
          change={kpis?.highRiskPatients?.change || '-4%'}
          trend="down"
          icon={AlertTriangle}
          color="danger"
          subtext="Requiring discharge bundle"
        />
        <KPICard
          title="Avg Readmission Risk"
          value={kpis?.avgRiskScore?.value ? `${(kpis.avgRiskScore.value * 100).toFixed(1)}%` : '28.4%'}
          change={kpis?.avgRiskScore?.change || '-2.1%'}
          trend="down"
          icon={Activity}
          color="warning"
          subtext="30-day predicted baseline"
        />
        <KPICard
          title="Prevented Readmissions"
          value={kpis?.preventedReadmissions?.value || '64'}
          change={kpis?.preventedReadmissions?.change || '+18%'}
          trend="up"
          icon={TrendingDown}
          color="success"
          subtext="Intervention successful"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                30-Day Readmission Trend vs National Average
              </h2>
              <p className="text-xs text-slate-500">Historical performance & ML forecasted trajectory</p>
            </div>
          </div>
          <div className="h-64 sm:h-72">
            <TrendChart data={trendData} />
          </div>
        </Card>

        <Card className="p-5">
          <div className="mb-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Risk Stratification Cohort
            </h2>
            <p className="text-xs text-slate-500">Current hospital census breakdown</p>
          </div>
          <div className="h-64 sm:h-72 flex flex-col justify-center">
            <RiskDistribution data={riskDist} />
          </div>
        </Card>
      </div>

      {/* High-Risk Patient Worklist & Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Worklist */}
        <Card className="p-5 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                High-Priority Readmission Worklist
              </h2>
              <p className="text-xs text-slate-500">
                Patients flagged by XGBoost model exceeding 50% readmission likelihood
              </p>
            </div>
            <Link
              to="/doctor/patients"
              className="text-xs font-semibold text-brand hover:underline inline-flex items-center gap-1"
            >
              <span>Full directory</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-2.5 px-3 font-semibold rounded-l-lg">Patient & MRN</th>
                  <th className="py-2.5 px-3 font-semibold">Diagnosis</th>
                  <th className="py-2.5 px-3 font-semibold">Risk Level</th>
                  <th className="py-2.5 px-3 font-semibold">Predicted %</th>
                  <th className="py-2.5 px-3 font-semibold text-right rounded-r-lg">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {highRiskPatients.slice(0, 5).map((patient) => (
                  <tr
                    key={patient.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {patient.name}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {patient.mrn} · {patient.age}y {patient.gender}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-slate-700 dark:text-slate-300 font-medium">
                        {patient.primaryDiagnosis || patient.condition}
                      </span>
                      <div className="text-[10px] text-slate-400">LOS: {patient.lengthOfStay || 4} days</div>
                    </td>
                    <td className="py-3 px-3">
                      <RiskBadge level={patient.riskLevel} size="sm" />
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-slate-900 dark:text-white">
                      {Math.round(patient.riskScore * 100)}%
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/doctor/predictions/${patient.id}`}>
                          <Button variant="primary" size="sm" className="text-xs py-1 px-2.5">
                            AI Rationale
                          </Button>
                        </Link>
                        <Link to={`/doctor/patients/${patient.id}`}>
                          <Button variant="secondary" size="sm" className="text-xs py-1 px-2">
                            Chart
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Recent Activity Timeline */}
        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Clinical Activity
            </h2>
            <span className="text-[11px] font-mono text-slate-400">Live EHR Stream</span>
          </div>
          <Timeline events={activities} />
        </Card>
      </div>
    </div>
  );
}
