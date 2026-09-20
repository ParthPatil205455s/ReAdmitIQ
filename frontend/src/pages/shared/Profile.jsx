import { useState } from 'react';
import { User, Mail, Shield, Building2, Bell, Lock, Check } from 'lucide-react';
import PageHeader from '../../components/shared/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';
import { useAuth } from '../../contexts/AuthContext';

export default function Profile() {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="User Account & Preferences"
        subtitle="Manage your clinical profile, contact email, and notification settings"
      />

      <Card className="p-6">
        <form onSubmit={handleSave} className="space-y-6">
          <div className="flex items-center gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
            <Avatar name={user?.name || 'User'} size="xl" />
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                {user?.name || 'Dr. Sarah Chen'}
              </h3>
              <p className="text-xs text-slate-500 capitalize">
                {user?.role || 'Doctor'} · {user?.department || 'Internal Medicine'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Full Name
              </label>
              <input
                type="text"
                defaultValue={user?.name || 'Dr. Sarah Chen'}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Provider / Account Email
              </label>
              <input
                type="email"
                defaultValue={user?.email || 'sarah.chen@metropolitan.health'}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Clinical Department
              </label>
              <input
                type="text"
                defaultValue={user?.department || 'Cardiology & Internal Medicine'}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Hospital Affiliation
              </label>
              <input
                type="text"
                defaultValue={user?.hospital || 'Metropolitan General Hospital'}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
            {saved ? (
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <Check className="w-4 h-4" /> Preferences saved!
              </span>
            ) : <span />}

            <Button type="submit" variant="primary" size="md">
              Save Account Changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
