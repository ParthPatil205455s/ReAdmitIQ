import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Bell,
  Sun,
  Moon,
  Menu,
  Shield,
  UserCheck,
  Stethoscope,
  User,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import NotificationPanel from './NotificationPanel';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import { notifications as initialNotifications } from '../../data/mockData';

export default function Topbar({ onMenuToggle }) {
  const { user, demoLogin } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState(initialNotifications);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const notifRef = useRef(null);
  const roleRef = useRef(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (roleRef.current && !roleRef.current.contains(event.target)) {
        setShowRoleMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSwitchRole = async (targetRole) => {
    await demoLogin(targetRole);
    setShowRoleMenu(false);
    if (targetRole === 'patient') navigate('/patient/dashboard');
    else if (targetRole === 'admin') navigate('/admin/dashboard');
    else navigate('/doctor/dashboard');
  };

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between transition-colors">
      {/* Left side: Hamburger & Global Search */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <button
          onClick={onMenuToggle}
          className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 lg:hidden rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative w-full max-w-xs sm:max-w-sm hidden md:block">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search patient, MRN, diagnosis... (Ctrl+K)"
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-800/80 text-slate-900 dark:text-white rounded-lg border border-transparent focus:border-brand dark:focus:border-brand-light focus:bg-white dark:focus:bg-slate-900 outline-none transition-all"
          />
        </div>
      </div>

      {/* Right side controls */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Quick Role Switcher Demo Badge */}
        <div className="relative" ref={roleRef}>
          <button
            onClick={() => setShowRoleMenu((v) => !v)}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-teal-50 text-brand border border-teal-200/80 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800 hover:bg-teal-100 dark:hover:bg-teal-900/60 transition-colors"
            title="Switch demo persona"
          >
            {user?.role === 'patient' && <User className="w-3.5 h-3.5" />}
            {user?.role === 'admin' && <Shield className="w-3.5 h-3.5" />}
            {user?.role === 'doctor' && <Stethoscope className="w-3.5 h-3.5" />}
            <span className="capitalize">{user?.role || 'doctor'}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl py-1 z-50 text-xs">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800">
                Switch Demo Persona
              </div>
              <button
                onClick={() => handleSwitchRole('doctor')}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
              >
                <Stethoscope className="w-4 h-4 text-brand" />
                <span>Dr. Sarah Chen (Doctor)</span>
              </button>
              <button
                onClick={() => handleSwitchRole('patient')}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
              >
                <User className="w-4 h-4 text-accent" />
                <span>James Wilson (Patient)</span>
              </button>
              <button
                onClick={() => handleSwitchRole('admin')}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
              >
                <Shield className="w-4 h-4 text-emerald-500" />
                <span>Michael Torres (Admin)</span>
              </button>
            </div>
          )}
        </div>

        {/* Dark Mode Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications((v) => !v)}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 relative transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
            )}
          </button>

          <NotificationPanel
            isOpen={showNotifications}
            notifications={notifications}
            onClose={() => setShowNotifications(false)}
            onMarkAllRead={() =>
              setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
            }
          />
        </div>

        {/* User Avatar & Name */}
        <div
          onClick={() => navigate('/profile')}
          className="flex items-center gap-2.5 pl-2 border-l border-slate-200 dark:border-slate-800 cursor-pointer group"
        >
          <Avatar name={user?.name || 'User'} size="sm" />
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 group-hover:text-brand transition-colors">
              {user?.name || 'Dr. Sarah Chen'}
            </p>
            <p className="text-[10px] text-slate-400 truncate max-w-[120px]">
              {user?.department || user?.hospital || 'Clinical Staff'}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
