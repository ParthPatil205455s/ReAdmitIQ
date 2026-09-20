import { cn, getRiskBadgeVariant } from '../../lib/utils';
import Badge from '../ui/Badge';
import { AlertCircle, AlertTriangle, CheckCircle2, Flame } from 'lucide-react';

const riskIcons = {
  low: CheckCircle2,
  medium: AlertTriangle,
  high: AlertCircle,
  critical: Flame,
};

export default function RiskBadge({ level = 'low', showIcon = true, size = 'md', className }) {
  const normalizedLevel = (level || 'low').toLowerCase();
  const Icon = riskIcons[normalizedLevel] || AlertCircle;
  const variant = getRiskBadgeVariant(normalizedLevel);

  const labels = {
    low: 'Low Risk',
    medium: 'Medium Risk',
    high: 'High Risk',
    critical: 'Critical Risk',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-semibold uppercase tracking-wider rounded-md transition-all',
        size === 'sm' && 'px-2 py-0.5 text-[10px]',
        size === 'md' && 'px-2.5 py-1 text-xs',
        size === 'lg' && 'px-3 py-1.5 text-sm',
        variant === 'success' && 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60',
        variant === 'warning' && 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60',
        variant === 'danger' && 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800/60',
        className
      )}
    >
      {showIcon && <Icon className={cn(size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5')} />}
      <span>{labels[normalizedLevel] || level}</span>
    </span>
  );
}
