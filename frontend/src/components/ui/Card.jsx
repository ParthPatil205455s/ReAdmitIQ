import { cn } from '../../lib/utils';

export default function Card({ className, hover = false, children, ...props }) {
  return (
    <div className={cn(hover ? 'card-hover' : 'card', className)} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }) {
  return (
    <div className={cn('px-6 py-4 border-b border-slate-200 dark:border-slate-800', className)} {...props}>
      {children}
    </div>
  );
}

export function CardBody({ className, children, ...props }) {
  return (
    <div className={cn('px-6 py-4', className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ className, children, ...props }) {
  return (
    <div className={cn('px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-surface-darkAlt rounded-b-md', className)} {...props}>
      {children}
    </div>
  );
}
