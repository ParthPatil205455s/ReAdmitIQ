import { CheckCircle2, Clock, Activity, FileText, AlertTriangle } from 'lucide-react';
import { cn, formatDate } from '../../lib/utils';

export default function Timeline({ events = [], className }) {
  const getIcon = (type) => {
    switch (type) {
      case 'assessment':
        return Activity;
      case 'admission':
      case 'discharge':
        return Clock;
      case 'medication':
        return CheckCircle2;
      case 'alert':
        return AlertTriangle;
      default:
        return FileText;
    }
  };

  return (
    <div className={cn('flow-root', className)}>
      <ul className="-mb-8">
        {events.map((event, idx) => {
          const isLast = idx === events.length - 1;
          const Icon = getIcon(event.type);

          return (
            <li key={event.id || idx}>
              <div className="relative pb-8">
                {!isLast && (
                  <span
                    className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-200 dark:bg-slate-800"
                    aria-hidden="true"
                  />
                )}
                <div className="relative flex space-x-3 items-start">
                  <div>
                    <span className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center ring-4 ring-white dark:ring-slate-900">
                      <Icon className="h-4 w-4 text-brand dark:text-brand-light" />
                    </span>
                  </div>
                  <div className="flex-1 min-w-0 pt-1.5 flex justify-between space-x-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {event.title || event.action}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {event.description || event.notes || event.details}
                      </p>
                      {event.actor && (
                        <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 block">
                          By: {event.actor}
                        </span>
                      )}
                    </div>
                    <div className="text-right text-xs whitespace-nowrap text-slate-400 dark:text-slate-500 font-mono">
                      {event.date || (event.timestamp ? formatDate(event.timestamp) : '')}
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
