import { cn, getInitials } from '../../lib/utils';

const sizes = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
};

export default function Avatar({ name, src, size = 'md', status, className }) {
  const initials = getInitials(name);

  return (
    <div className={cn('relative inline-flex items-center justify-center rounded-full font-semibold flex-shrink-0', sizes[size], className)}>
      {src ? (
        <img src={src} alt={name} className="w-full h-full rounded-full object-cover" />
      ) : (
        <div className="w-full h-full rounded-full bg-gradient-to-br from-brand to-accent flex items-center justify-center text-white">
          {initials}
        </div>
      )}
      {status && (
        <span
          className={cn(
            'absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-surface-dark',
            {
              'bg-emerald-500': status === 'online',
              'bg-amber-500': status === 'away',
              'bg-slate-400': status === 'offline',
              'bg-red-500': status === 'busy',
            },
          )}
        />
      )}
    </div>
  );
}
