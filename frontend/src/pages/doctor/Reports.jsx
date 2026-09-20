import { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Calendar,
  Filter,
  BarChart2,
  TrendingDown,
  CheckCircle,
} from 'lucide-react';
import PageHeader from '../../components/shared/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import AdmissionsChart from '../../components/charts/AdmissionsChart';
import TrendChart from '../../components/charts/TrendChart';
import { fetchAdmissionTrends, fetchTrendData, downloadPredictionReport, downloadPatientReport } from '../../api/endpoints';

export default function Reports() {
  const [trends, setTrends] = useState([]);
  const [admissions, setAdmissions] = useState([]);

  useEffect(() => {
    fetchTrendData().then((t) => setTrends(t || []));
    fetchAdmissionTrends().then((a) => setAdmissions(a || []));
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clinical Readmission Analytics & Quality Reports"
        subtitle="Departmental compliance, 30-day post-discharge outcomes, and CMS quality reporting"
        breadcrumbs={[
          { label: 'Doctor Portal', href: '/doctor/dashboard' },
          { label: 'Clinical Analytics' },
        ]}
        actions={
          <Button
            variant="primary"
            size="sm"
            className="gap-1.5"
            onClick={() => alert('Exporting CMS HRRP Hospital Quality Report (PDF)...')}
          >
            <Download className="w-4 h-4" />
            <span>Export Quality Report (PDF)</span>
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5 space-y-4">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Inpatient Admissions vs Prevented Readmissions
            </h3>
            <p className="text-xs text-slate-500">Trailing 6 months hospital census trend</p>
          </div>
          <div className="h-72">
            <AdmissionsChart data={admissions} />
          </div>
        </Card>

        <Card className="p-5 space-y-4">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Readmission Rate Benchmark Comparison
            </h3>
            <p className="text-xs text-slate-500">Hospital actuals vs Regional & National averages</p>
          </div>
          <div className="h-72">
            <TrendChart data={trends} />
          </div>
        </Card>
      </div>

      <Card className="p-5 space-y-4">
        <h3 className="font-bold text-base text-slate-900 dark:text-white">
          Generated Diagnostic & Discharge Quality Audits
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Report Name</th>
                <th className="py-3 px-4">Period</th>
                <th className="py-3 px-4">Cohort Size</th>
                <th className="py-3 px-4">Readmission Rate</th>
                <th className="py-3 px-4 text-right">Download</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {[
                { name: 'Latest Assessment Report (P-001)', type: 'prediction', id: 'p-001', period: 'Today', size: '1 patient', rate: '10.8%', status: 'Ready' },
                { name: 'Complete Patient Record (P-001)', type: 'patient', id: 'p-001', period: 'All Time', size: '1 patient', rate: 'N/A', status: 'Ready' },
                { name: 'Heart Failure Care Coordination', type: 'prediction', id: 'p-002', period: 'Q2 2026', size: '1 patient', rate: '11.2%', status: 'Ready' },
              ].map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    <span>{row.name}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-500">{row.period}</td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{row.size}</td>
                  <td className="py-3 px-4 font-mono font-bold text-teal-600 dark:text-teal-400">{row.rate}</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => row.type === 'prediction' ? downloadPredictionReport(row.id) : downloadPatientReport(row.id)}
                      className="text-brand dark:text-brand-light hover:underline font-semibold"
                    >
                      PDF
                    </button>
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
