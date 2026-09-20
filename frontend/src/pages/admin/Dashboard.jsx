import { useState, useEffect } from 'react';
import {
  Building2,
  TrendingDown,
  DollarSign,
  ShieldCheck,
  Cpu,
  Activity,
  AlertCircle,
  FileCheck,
} from 'lucide-react';
import PageHeader from '../../components/shared/PageHeader';
import KPICard from '../../components/shared/KPICard';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import AdmissionsChart from '../../components/charts/AdmissionsChart';
import TrendChart from '../../components/charts/TrendChart';
import {
  fetchKPIStats,
  fetchAdmissionTrends,
  fetchTrendData,
  fetchAuditLogs,
} from '../../api/endpoints';

export default function AdminDashboard() {
  const [kpis, setKpis] = useState(null);
  const [admissions, setAdmissions] = useState([]);
  const [trends, setTrends] = useState([]);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetchKPIStats().then(setKpis);
    fetchAdmissionTrends().then((a) => setAdmissions(a || []));
    fetchTrendData().then((t) => setTrends(t || []));
    fetchAuditLogs().then((l) => setLogs(l || []));
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Executive Healthcare Operations & AI Governance"
        subtitle="Hospital-wide readmission risk surveillance, CMS value-based penalty mitigation, and system metrics"
      />

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Hospital Readmission Rate"
          value="11.8%"
          change="-4.6%"
          trend="down"
          icon={TrendingDown}
          color="success"
          subtext="vs 16.4% Nat'l Benchmark"
        />
        <KPICard
          title="CMS Penalty Exposure"
          value="$0"
          change="100% Safe"
          trend="up"
          icon={ShieldCheck}
          color="brand"
          subtext="Zero HRRP penalty category"
        />
        <KPICard
          title="Prevented Cost Savings"
          value="$2.4M"
          change="+28%"
          trend="up"
          icon={DollarSign}
          color="accent"
          subtext="Estimated FY avoidances"
        />
        <KPICard
          title="AI Inference Health"
          value="99.98%"
          change="42ms"
          trend="up"
          icon={Cpu}
          color="brand"
          subtext="EHR FHIR API Uptime"
        />
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5 space-y-4">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Hospital Admission & Readmission Volume
            </h3>
            <p className="text-xs text-slate-500">Trailed by ReAdmitIQ automated early intervention</p>
          </div>
          <div className="h-72">
            <AdmissionsChart data={admissions} />
          </div>
        </Card>

        <Card className="p-5 space-y-4">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Readmission Rate Trajectory vs CMS Target
            </h3>
            <p className="text-xs text-slate-500">Continuous 12-month performance curve</p>
          </div>
          <div className="h-72">
            <TrendChart data={trends} />
          </div>
        </Card>
      </div>

      {/* System Audit & Compliance Feed */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Security & HIPAA Compliance Audit Trail
            </h3>
            <p className="text-xs text-slate-500">Immutable record of model inferences and provider chart access</p>
          </div>
          <span className="text-xs font-mono text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
            SOC-2 Type II Verified
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Event / Action</th>
                <th className="py-2.5 px-3">User</th>
                <th className="py-2.5 px-3">Role</th>
                <th className="py-2.5 px-3">Patient MRN</th>
                <th className="py-2.5 px-3">IP / Host</th>
                <th className="py-2.5 px-3 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {logs.slice(0, 5).map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">
                    {log.action}
                  </td>
                  <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">{log.user}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-1.5 py-0.5 rounded text-[10px] uppercase font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {log.role}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-500">{log.patientId || log.mrn || 'N/A'}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-400 text-[11px]">{log.ip || '10.24.18.92'}</td>
                  <td className="py-2.5 px-3 text-right text-slate-400 font-mono text-[11px]">
                    {log.timestamp || '2 mins ago'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
