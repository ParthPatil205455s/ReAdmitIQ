import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, Trash2, ExternalLink, AlertTriangle, Info, CheckCircle, AlertCircle } from 'lucide-react';
import { cn, formatRelativeTime } from '../../lib/utils';
import Button from '../ui/Button';

export default function NotificationPanel({
  notifications = [],
  isOpen,
  onClose,
  onMarkAllRead,
  className,
}) {
  const [filter, setFilter] = useState('all'); // all | unread
  const [items, setItems] = useState(notifications);

  const unreadCount = items.filter((n) => !n.read).length;
  const filtered = filter === 'unread' ? items.filter((n) => !n.read) : items;

  const handleMarkAll = () => {
    setItems((prev) => prev.map((item) => ({ ...item, read: true })));
    if (onMarkAllRead) onMarkAllRead();
  };

  const handleToggleRead = (id) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, read: !item.read } : item))
    );
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'critical':
      case 'high':
      case 'danger':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      default:
        return <Info className="w-4 h-4 text-brand" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        'absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-900/10 z-50 overflow-hidden',
        className
      )}
    >
      <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-slate-500" />
          <span className="font-semibold text-sm text-slate-900 dark:text-white">Notifications</span>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.5 text-[10px] font-bold bg-brand text-white rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAll}
              className="text-xs text-brand hover:underline font-medium"
            >
              Mark all read
            </button>
          )}
        </div>
      </div>

      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No notifications to display
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => handleToggleRead(item.id)}
              className={cn(
                'p-3.5 flex items-start gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors text-left',
                !item.read && 'bg-brand/5 dark:bg-brand-light/5'
              )}
            >
              <div className="mt-0.5 shrink-0">{getNotificationIcon(item.type)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                    {item.title}
                  </p>
                  {!item.read && (
                    <span className="w-2 h-2 rounded-full bg-brand shrink-0" />
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                  {item.message}
                </p>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block">
                  {formatRelativeTime(item.timestamp || item.time)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
