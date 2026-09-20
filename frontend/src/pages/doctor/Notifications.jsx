import { useState, useEffect } from 'react';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Info,
  AlertCircle,
  Clock,
  Trash2,
} from 'lucide-react';
import PageHeader from '../../components/shared/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { fetchNotifications } from '../../api/endpoints';
import { formatRelativeTime } from '../../lib/utils';

export default function Notifications() {
  const [list, setList] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchNotifications().then((n) => setList(n || []));
  }, []);

  const handleMarkAll = () => {
    setList((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const filtered = filter === 'unread' ? list.filter((n) => !n.read) : list;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clinical Alerts & Task Queue"
        subtitle="Real-time notifications, high-risk flags, and urgent discharge coordination alerts"
        breadcrumbs={[
          { label: 'Doctor Portal', href: '/doctor/dashboard' },
          { label: 'Alerts & Tasks' },
        ]}
        actions={
          <Button variant="secondary" size="sm" onClick={handleMarkAll}>
            Mark All as Read
          </Button>
        }
      />

      <Card className="divide-y divide-slate-100 dark:divide-slate-800">
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg ${
                filter === 'all' ? 'bg-brand text-white' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              All Alerts ({list.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg ${
                filter === 'unread' ? 'bg-brand text-white' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Unread ({list.filter((n) => !n.read).length})
            </button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No notifications in this view.
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              className={`p-4 flex items-start gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors ${
                !item.read ? 'bg-brand/5 dark:bg-brand-light/5' : ''
              }`}
            >
              <div className="mt-1">
                {item.type === 'critical' ? (
                  <AlertCircle className="w-5 h-5 text-red-500" />
                ) : item.type === 'warning' ? (
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                ) : (
                  <Info className="w-5 h-5 text-teal-500" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {item.title}
                  </h4>
                  <span className="text-xs text-slate-400 font-mono">
                    {formatRelativeTime(item.timestamp || item.time)}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                  {item.message}
                </p>
              </div>
            </div>
          ))
        )}
      </Card>
    </div>
  );
}
