import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '../../lib/utils';
import Card from '../ui/Card';

export default function KPICard({
  title,
  value,
  change,
  trend = 'neutral',
  icon: Icon,
  color = 'brand',
  subtext,
  className,
}) {
  const colorMap = {
    brand: 'bg-brand/10 text-brand dark:bg-brand-light/15 dark:text-brand-light',
    accent: 'bg-accent/10 text-accent dark:bg-accent-light/15 dark:text-accent-light',
    success: 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400',
    warning: 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400',
    danger: 'bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400',
  };

  const isUp = trend === 'up';
  const isDown = trend === 'down';

  return (
    <Card className={cn('p-5 hover:border-brand/40 transition-all duration-200', className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {title}
          </p>
          <p className="text-2xl lg:text-3xl font-bold font-mono text-slate-900 dark:text-white tracking-tight">
            {value}
          </p>
        </div>
        {Icon && (
          <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-xs', colorMap[color] || colorMap.brand)}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {(change || subtext) && (
        <div className="mt-3 flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/60 text-xs">
          {change && (
            <span
              className={cn(
                'inline-flex items-center gap-0.5 font-semibold px-1.5 py-0.5 rounded',
                isUp && 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400',
                isDown && 'text-red-600 bg-red-50 dark:bg-red-950/40 dark:text-red-400',
                !isUp && !isDown && 'text-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-400'
              )}
            >
              {isUp && <TrendingUp className="w-3 h-3 inline mr-0.5" />}
              {isDown && <TrendingDown className="w-3 h-3 inline mr-0.5" />}
              {!isUp && !isDown && <Minus className="w-3 h-3 inline mr-0.5" />}
              {change}
            </span>
          )}
          {subtext && (
            <span className="text-slate-500 dark:text-slate-400 truncate">
              {subtext}
            </span>
          )}
        </div>
      )}
    </Card>
  );
}
