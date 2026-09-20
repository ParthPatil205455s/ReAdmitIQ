import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import { useTheme } from '../../contexts/ThemeContext';

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="card p-3 shadow-lg">
      <p className="text-sm font-semibold text-slate-900 dark:text-white">{d.feature}</p>
      <p className="text-sm text-slate-600 dark:text-slate-400">
        Value: {d.value}
      </p>
      <p className="text-sm" style={{ color: d.contribution > 0 ? '#EF4444' : '#10B981' }}>
        Contribution: {d.contribution > 0 ? '+' : ''}{(d.contribution * 100).toFixed(1)}%
      </p>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-[200px]">{d.description}</p>
    </div>
  );
};

export default function SHAPWaterfall({ data, height = 400 }) {
  const { isDark } = useTheme();
  const textColor = isDark ? '#94a3b8' : '#64748b';

  // Sort by absolute contribution descending
  const sorted = [...data].sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution)).slice(0, 10);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={sorted} layout="vertical" margin={{ top: 5, right: 30, bottom: 5, left: 140 }}>
        <XAxis
          type="number"
          tick={{ fontSize: 11, fill: textColor }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${v > 0 ? '+' : ''}${(v * 100).toFixed(0)}%`}
          domain={['auto', 'auto']}
        />
        <YAxis
          type="category"
          dataKey="feature"
          tick={{ fontSize: 12, fill: textColor }}
          axisLine={false}
          tickLine={false}
          width={130}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)' }} />
        <ReferenceLine x={0} stroke={isDark ? '#334155' : '#e2e8f0'} />
        <Bar dataKey="contribution" radius={[0, 4, 4, 0]} animationDuration={800}>
          {sorted.map((entry, i) => (
            <Cell key={i} fill={entry.contribution > 0 ? '#EF4444' : '#10B981'} fillOpacity={0.85} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
