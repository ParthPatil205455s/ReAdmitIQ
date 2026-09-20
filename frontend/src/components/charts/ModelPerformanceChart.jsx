import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, Cell } from 'recharts';
import { useTheme } from '../../contexts/ThemeContext';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="card p-3 shadow-lg">
      <p className="text-sm font-semibold text-slate-900 dark:text-white mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-sm" style={{ color: p.color }}>
          {p.name}: {typeof p.value === 'number' && p.value < 1 ? (p.value * 100).toFixed(1) + '%' : p.value}
        </p>
      ))}
    </div>
  );
};

export function ROCCurve({ data, height = 300 }) {
  const { isDark } = useTheme();
  const gridColor = isDark ? '#1e293b' : '#f1f5f9';
  const textColor = isDark ? '#94a3b8' : '#64748b';

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
        <defs>
          <linearGradient id="roc-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
        <XAxis dataKey="fpr" tick={{ fontSize: 11, fill: textColor }} axisLine={false} tickLine={false} label={{ value: 'False Positive Rate', position: 'bottom', fontSize: 12, fill: textColor }} />
        <YAxis tick={{ fontSize: 11, fill: textColor }} axisLine={false} tickLine={false} label={{ value: 'True Positive Rate', angle: -90, position: 'insideLeft', fontSize: 12, fill: textColor }} />
        <Tooltip content={<CustomTooltip />} />
        <Area type="monotone" dataKey="tpr" name="ROC Curve" stroke="#4F46E5" strokeWidth={2} fill="url(#roc-gradient)" animationDuration={800} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function FeatureImportanceChart({ data, height = 350 }) {
  const { isDark } = useTheme();
  const textColor = isDark ? '#94a3b8' : '#64748b';

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, bottom: 5, left: 140 }}>
        <XAxis type="number" tick={{ fontSize: 11, fill: textColor }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} />
        <YAxis type="category" dataKey="feature" tick={{ fontSize: 12, fill: textColor }} axisLine={false} tickLine={false} width={130} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)' }} />
        <Bar dataKey="importance" name="Importance" radius={[0, 4, 4, 0]} animationDuration={800}>
          {data.map((_, i) => (
            <Cell key={i} fill={`hsl(${160 + i * 15}, 70%, ${isDark ? 50 : 40}%)`} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export default function ModelPerformanceChart({ rocData, featureData, height = 300 }) {
  const defaultRoc = [
    { fpr: 0, tpr: 0 },
    { fpr: 0.05, tpr: 0.72 },
    { fpr: 0.1, tpr: 0.86 },
    { fpr: 0.2, tpr: 0.92 },
    { fpr: 0.4, tpr: 0.96 },
    { fpr: 0.7, tpr: 0.98 },
    { fpr: 1, tpr: 1 },
  ];

  const defaultFeatures = [
    { feature: 'HbA1c Elevation', importance: 0.28 },
    { feature: 'Prior Admissions (6m)', importance: 0.22 },
    { feature: 'Polypharmacy Index', importance: 0.18 },
    { feature: 'Length of Stay', importance: 0.14 },
    { feature: 'Serum Creatinine', importance: 0.10 },
    { feature: 'Living Alone (SDOH)', importance: 0.08 },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div>
        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          ROC Curve (AUC = 0.942)
        </h4>
        <ROCCurve data={rocData || defaultRoc} height={height} />
      </div>
      <div>
        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Global Feature Importance
        </h4>
        <FeatureImportanceChart data={featureData || defaultFeatures} height={height} />
      </div>
    </div>
  );
}
