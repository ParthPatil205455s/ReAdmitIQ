import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useTheme } from '../../contexts/ThemeContext';

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="card p-3 shadow-lg">
      <p className="text-sm font-semibold text-slate-900 dark:text-white">{d.name} Risk</p>
      <p className="text-sm text-slate-600 dark:text-slate-400">
        {d.value} patients ({d.percentage}%)
      </p>
    </div>
  );
};

export default function RiskDistribution({ data, height = 300 }) {
  const { isDark } = useTheme();

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={4}
          dataKey="value"
          animationBegin={0}
          animationDuration={800}
          animationEasing="ease-out"
        >
          {data.map((entry, i) => (
            <Cell
              key={i}
              fill={entry.color}
              stroke={isDark ? '#111827' : '#ffffff'}
              strokeWidth={2}
            />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          verticalAlign="bottom"
          height={36}
          formatter={(value) => (
            <span className="text-sm text-slate-600 dark:text-slate-400">{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
