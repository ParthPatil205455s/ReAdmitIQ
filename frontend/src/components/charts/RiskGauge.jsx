import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { cn, formatPercentage, getRiskLevel, getRiskLabel } from '../../lib/utils';

export default function RiskGauge({ score = 0, size = 200, animated = true, className }) {
  const [displayScore, setDisplayScore] = useState(animated ? 0 : score);
  const requestRef = useRef();
  const startTimeRef = useRef();

  const pct = displayScore * 100;
  const level = getRiskLevel(displayScore);
  const label = getRiskLabel(level);

  // Animate the score counter
  useEffect(() => {
    if (!animated) { setDisplayScore(score); return; }
    const duration = 1500;
    startTimeRef.current = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setDisplayScore(score * eased);
      if (progress < 1) requestRef.current = requestAnimationFrame(animate);
    };
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [score, animated]);

  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - (displayScore * 0.75)); // 270deg arc
  const center = size / 2;

  const colorMap = {
    low: { stroke: '#10B981', glow: 'rgba(16,185,129,0.3)', text: 'text-emerald-500' },
    medium: { stroke: '#F59E0B', glow: 'rgba(245,158,11,0.3)', text: 'text-amber-500' },
    high: { stroke: '#EF4444', glow: 'rgba(239,68,68,0.3)', text: 'text-red-500' },
    critical: { stroke: '#DC2626', glow: 'rgba(220,38,38,0.4)', text: 'text-red-600' },
  };

  const colors = colorMap[level];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={cn('relative inline-flex items-center justify-center', className)}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-[135deg]"
      >
        {/* Background track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          className="stroke-slate-200 dark:stroke-slate-700"
          strokeWidth={12}
          strokeLinecap="round"
          strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
        />

        {/* Active arc */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={colors.stroke}
          strokeWidth={12}
          strokeLinecap="round"
          strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
          strokeDashoffset={strokeDashoffset}
          style={{
            filter: `drop-shadow(0 0 8px ${colors.glow})`,
            transition: animated ? 'none' : 'stroke-dashoffset 0.8s ease-out',
          }}
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn('text-4xl font-bold tabular-nums', colors.text)}>
          {formatPercentage(pct, 0)}
        </span>
        <span className={cn('text-sm font-semibold mt-1', colors.text)}>
          {label}
        </span>
        <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Readmission Risk
        </span>
      </div>
    </motion.div>
  );
}
