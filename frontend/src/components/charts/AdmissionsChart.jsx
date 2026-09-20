import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useTheme } from '../../contexts/ThemeContext';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="card p-3 shadow-lg">
      <p className="text-sm font-semibold text-slate-900 dark:text-white mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-sm" style={{ color: p.color }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

export default function AdmissionsChart({ data, height = 300 }) {
  const { isDark } = useTheme();
  const gridColor = isDark ? '#1e293b' : '#f1f5f9';
  const textColor = isDark ? '#94a3b8' : '#64748b';

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
        <XAxis dataKey="week" tick={{ fontSize: 12, fill: textColor }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 12, fill: textColor }} axisLine={false} tickLine={false} width={40} />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          verticalAlign="top"
          height={36}
          formatter={(value) => <span className="text-sm text-slate-600 dark:text-slate-400">{value}</span>}
        />
        <Line type="monotone" dataKey="admissions" name="Admissions" stroke="#0F766E" strokeWidth={2} dot={{ r: 4, fill: '#0F766E' }} activeDot={{ r: 6 }} animationDuration={800} />
        <Line type="monotone" dataKey="readmissions" name="Readmissions" stroke="#EF4444" strokeWidth={2} dot={{ r: 4, fill: '#EF4444' }} activeDot={{ r: 6 }} animationDuration={800} />
        <Line type="monotone" dataKey="predicted" name="Predicted" stroke="#F59E0B" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3, fill: '#F59E0B' }} animationDuration={800} />
      </LineChart>
    </ResponsiveContainer>
  );
}
