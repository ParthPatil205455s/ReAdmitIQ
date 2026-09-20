import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  BarChart3,
  Bell,
  Activity,
  Calendar,
  FileCheck,
  ShieldCheck,
  Cpu,
  UserCheck,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  HeartPulse,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../contexts/AuthContext';

export default function Sidebar({ collapsed, onToggle }) {
  const { user, logout } = useAuth();
  const role = user?.role || 'doctor';

  const doctorNav = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/doctor/dashboard' },
    { label: 'Patient Worklist', icon: Users, path: '/doctor/patients' },
    { label: 'Clinical Analytics', icon: BarChart3, path: '/doctor/reports' },
    { label: 'Alerts & Tasks', icon: Bell, path: '/doctor/notifications' },
  ];

  const patientNav = [
    { label: 'Health Overview', icon: LayoutDashboard, path: '/patient/dashboard' },
    { label: 'Readmission Risk', icon: Activity, path: '/patient/risk' },
    { label: 'Medical History', icon: Calendar, path: '/patient/history' },
    { label: 'Care Plan', icon: FileCheck, path: '/patient/care-plan' },
  ];

  const adminNav = [
    { label: 'Executive Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
    { label: 'Hospital Analytics', icon: BarChart3, path: '/admin/analytics' },
    { label: 'User Management', icon: UserCheck, path: '/admin/users' },
    { label: 'AI Model Monitor', icon: Cpu, path: '/admin/model-monitor' },
  ];

  const navItems = role === 'patient' ? patientNav : role === 'admin' ? adminNav : doctorNav;

  return (
    <aside
      className={cn(
        'fixed top-0 left-0 h-screen bg-slate-900 text-slate-200 border-r border-slate-800/80 z-40 transition-all duration-300 flex flex-col',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
        <NavLink to="/" className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand to-teal-400 flex items-center justify-center shrink-0 shadow-lg shadow-teal-500/20">
            <HeartPulse className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div className="leading-tight">
              <span className="font-bold text-base text-white tracking-wide flex items-center gap-1.5">
                ReAdmit<span className="text-teal-400">IQ</span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-teal-950 text-teal-400 border border-teal-800">
                  AI
                </span>
              </span>
              <span className="text-[11px] text-slate-400 block truncate">Clinical Decision Support</span>
            </div>
          )}
        </NavLink>
      </div>

      {/* Navigation items */}
      <div className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
          {!collapsed ? `${role} Portal` : '•'}
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group',
                  isActive
                    ? 'bg-brand text-white shadow-md shadow-brand/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                )
              }
              title={collapsed ? item.label : undefined}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          );
        })}

        <div className="pt-4 px-3 pb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
          {!collapsed ? 'Governance & Docs' : '•'}
        </div>

        <NavLink
          to="/model-card"
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group',
              isActive
                ? 'bg-brand text-white'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
            )
          }
          title={collapsed ? 'Model Card (AI Transparency)' : undefined}
        >
          <ShieldCheck className="w-5 h-5 shrink-0 text-teal-400" />
          {!collapsed && <span className="truncate">Model Card (Transparency)</span>}
        </NavLink>
      </div>

      {/* Footer Profile & Logout */}
      <div className="p-3 border-t border-slate-800 space-y-2">
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center p-1.5 text-xs text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <div className="flex items-center gap-1.5"><ChevronLeft className="w-4 h-4" /><span>Collapse Sidebar</span></div>}
        </button>

        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
          title={collapsed ? 'Sign Out' : undefined}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && <span className="truncate">Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
