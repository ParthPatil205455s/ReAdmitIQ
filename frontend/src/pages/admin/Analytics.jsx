import { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Download,
  Filter,
  PieChart as PieIcon,
} from 'lucide-react';
import PageHeader from '../../components/shared/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

export default function Analytics() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Comprehensive Hospital Readmission Analytics"
        subtitle="Stratification across clinical service lines, diagnosis-related groups (DRGs), and insurance payers"
        breadcrumbs={[
          { label: 'Executive Portal', href: '/admin/dashboard' },
          { label: 'Analytics' },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 space-y-4">
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            Readmission Rate by Clinical Service Line
          </h3>
          <div className="space-y-4 pt-2">
            {[
              { dept: 'Cardiology (Heart Failure & AMI)', rate: 14.2, target: 17.5, color: 'bg-teal-500' },
              { dept: 'Pulmonology (COPD & Pneumonia)', rate: 13.8, target: 16.9, color: 'bg-indigo-500' },
              { dept: 'General Internal Medicine', rate: 11.2, target: 15.0, color: 'bg-emerald-500' },
              { dept: 'Orthopedic Surgery (Total Joint)', rate: 4.8, target: 7.2, color: 'bg-amber-500' },
              { dept: 'Nephrology (End-Stage Renal Disease)', rate: 16.1, target: 19.4, color: 'bg-rose-500' },
            ].map((item, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{item.dept}</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {item.rate}% <span className="text-slate-400 font-normal">(Target: {item.target}%)</span>
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${item.color}`}
                    style={{ width: `${(item.rate / 25) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            Payer Distribution & Value-Based Contract Savings
          </h3>
          <div className="space-y-4 pt-2">
            {[
              { payer: 'Traditional Medicare Fee-For-Service', share: '48%', savings: '$1,150,000' },
              { payer: 'Medicare Advantage (HMO/PPO)', share: '28%', savings: '$780,000' },
              { payer: 'Commercial & Employer Sponsored', share: '16%', savings: '$340,000' },
              { payer: 'Medicaid Managed Care', share: '8%', savings: '$130,000' },
            ].map((p, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">{p.payer}</span>
                  <span className="text-slate-500">Inpatient Share: {p.share}</span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 block">
                    {p.savings}
                  </span>
                  <span className="text-[10px] text-slate-400">Avoidance Yield</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
