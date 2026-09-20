import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export default function ProgressBar({ value = 0, max = 100, color = 'brand', size = 'md', showLabel = false, className }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  const heights = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-4' };
  const colors = {
    brand: 'bg-brand',
    accent: 'bg-accent',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-red-500',
  };

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between mb-1">
          <span className="text-xs text-slate-500 dark:text-slate-400">{Math.round(pct)}%</span>
        </div>
      )}
      <div className={cn('w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden', heights[size])}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={cn('h-full rounded-full', colors[color])}
        />
      </div>
    </div>
  );
}
