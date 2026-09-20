import { useState } from 'react';
import {
  CheckCircle2,
  Calendar,
  Pill,
  Activity,
  Heart,
  FileCheck,
} from 'lucide-react';
import PageHeader from '../../components/shared/PageHeader';
import Card from '../../components/ui/Card';
import ProgressBar from '../../components/ui/ProgressBar';
import { carePlanItems } from '../../data/mockData';

export default function CarePlan() {
  const [items, setItems] = useState(carePlanItems);

  const toggle = (id) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
  };

  const doneCount = items.filter((i) => i.completed).length;
  const pct = Math.round((doneCount / items.length) * 100);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Personalized Home Recovery Plan"
        subtitle="Daily routine formulated by your discharge team to maintain stability at home"
        breadcrumbs={[
          { label: 'Patient Portal', href: '/patient/dashboard' },
          { label: 'Care Plan' },
        ]}
      />

      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              30-Day Recovery Roadmap
            </h3>
            <p className="text-xs text-slate-500">Day 6 of 30 · Daily Protocol</p>
          </div>
          <span className="font-mono text-sm font-bold text-teal-600 dark:text-teal-400">
            {pct}% Complete
          </span>
        </div>

        <ProgressBar value={pct} showLabel={false} />

        <div className="pt-4 space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              onClick={() => toggle(item.id)}
              className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                item.completed
                  ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-teal-500'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-colors ${
                    item.completed
                      ? 'bg-teal-600 border-teal-600 text-white'
                      : 'border-slate-300 dark:border-slate-600'
                  }`}
                >
                  {item.completed && <CheckCircle2 className="w-4 h-4" />}
                </div>
                <div>
                  <span
                    className={`text-sm font-semibold block ${
                      item.completed ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'
                    }`}
                  >
                    {item.title}
                  </span>
                  <span className="text-xs text-slate-500">{item.description || item.freq}</span>
                </div>
              </div>
              <span className="text-xs font-mono text-slate-400">{item.time}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
