import { cn } from '../../lib/utils';

const colorMap = {
  success: 'badge-success',
  warning: 'badge-warning',
  danger: 'badge-danger',
  info: 'badge-info',
  neutral: 'badge-neutral',
};

export default function Badge({ variant = 'neutral', dot = false, children, className, ...props }) {
  return (
    <span className={cn(colorMap[variant], className)} {...props}>
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full', {
        'bg-emerald-500': variant === 'success',
        'bg-amber-500': variant === 'warning',
        'bg-red-500': variant === 'danger',
        'bg-blue-500': variant === 'info',
        'bg-slate-500': variant === 'neutral',
      })} />}
      {children}
    </span>
  );
}
