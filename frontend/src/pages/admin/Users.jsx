import { useState, useEffect } from 'react';
import {
  Users as UsersIcon,
  UserPlus,
  Shield,
  Stethoscope,
  User,
  MoreVertical,
  CheckCircle2,
} from 'lucide-react';
import PageHeader from '../../components/shared/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';
import { fetchUsers } from '../../api/endpoints';

export default function Users() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers().then((u) => setUsers(u || []));
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hospital System User Access & RBAC Directory"
        subtitle="Manage clinical staff credentials, EHR single-sign-on authorizations, and role boundaries"
        breadcrumbs={[
          { label: 'Executive Portal', href: '/admin/dashboard' },
          { label: 'Users' },
        ]}
        actions={
          <Button
            variant="primary"
            size="sm"
            className="gap-1.5"
            onClick={() => alert('Add New Clinical Staff Modal')}
          >
            <UserPlus className="w-4 h-4" />
            <span>Provision Provider Account</span>
          </Button>
        }
      />

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Last Login</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="py-3 px-4 flex items-center gap-3">
                    <Avatar name={u.name} size="sm" />
                    <div>
                      <span className="font-semibold text-slate-900 dark:text-white block">
                        {u.name}
                      </span>
                      <span className="text-[11px] text-slate-400">{u.email}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded text-[10px] uppercase font-mono bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-700 dark:text-slate-300">{u.department || 'Clinical Medicine'}</td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Active
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">{u.lastLogin || 'Today, 10:14 AM'}</td>
                  <td className="py-3 px-4 text-right">
                    <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
