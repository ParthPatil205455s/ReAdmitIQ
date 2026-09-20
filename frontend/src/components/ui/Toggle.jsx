import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export default function Toggle({ enabled, onChange, label, size = 'md', className }) {
  const sizes = {
    sm: { track: 'w-8 h-4', thumb: 'w-3 h-3', translate: 'translate-x-4' },
    md: { track: 'w-10 h-5', thumb: 'w-4 h-4', translate: 'translate-x-5' },
    lg: { track: 'w-12 h-6', thumb: 'w-5 h-5', translate: 'translate-x-6' },
  };

  const s = sizes[size];

  return (
    <button
      role="switch"
      aria-checked={enabled}
      onClick={() => onChange(!enabled)}
      className={cn('inline-flex items-center gap-2', className)}
    >
      <div
        className={cn(
          'relative rounded-full transition-colors duration-200',
          s.track,
          enabled ? 'bg-brand' : 'bg-slate-300 dark:bg-slate-700',
        )}
      >
        <motion.div
          layout
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className={cn(
            'absolute top-0.5 left-0.5 rounded-full bg-white shadow-sm',
            s.thumb,
            enabled && s.translate,
          )}
        />
      </div>
      {label && (
        <span className="text-sm text-slate-700 dark:text-slate-300">{label}</span>
      )}
    </button>
  );
}
