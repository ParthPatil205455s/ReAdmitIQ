import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

// Public pages
import Landing from '../pages/public/Landing';
import Login from '../pages/public/Login';
import NotFound from '../pages/public/NotFound';

// Doctor pages
import DoctorDashboard from '../pages/doctor/Dashboard';
import PatientList from '../pages/doctor/PatientList';
import PatientDetail from '../pages/doctor/PatientDetail';
import NewAssessment from '../pages/doctor/NewAssessment';
import PredictionResult from '../pages/doctor/PredictionResult';
import Reports from '../pages/doctor/Reports';
import Notifications from '../pages/doctor/Notifications';

// Patient pages
import PatientDashboard from '../pages/patient/Dashboard';
import MyRisk from '../pages/patient/MyRisk';
import MyHistory from '../pages/patient/MyHistory';
import CarePlan from '../pages/patient/CarePlan';

// Admin pages
import AdminDashboard from '../pages/admin/Dashboard';
import Analytics from '../pages/admin/Analytics';
import Users from '../pages/admin/Users';
import ModelMonitor from '../pages/admin/ModelMonitor';

// Shared pages
import Profile from '../pages/shared/Profile';
import ModelCard from '../pages/shared/ModelCard';

export default function AppRouter() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />

      {/* Doctor routes */}
      <Route element={<ProtectedRoute allowedRoles={['doctor']} />}>
        <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
        <Route path="/doctor/patients" element={<PatientList />} />
        <Route path="/doctor/patients/:id" element={<PatientDetail />} />
        <Route path="/doctor/assess/:id" element={<NewAssessment />} />
        <Route path="/doctor/predictions/:id" element={<PredictionResult />} />
        <Route path="/doctor/reports" element={<Reports />} />
        <Route path="/doctor/notifications" element={<Notifications />} />
      </Route>

      {/* Patient routes */}
      <Route element={<ProtectedRoute allowedRoles={['patient']} />}>
        <Route path="/patient/dashboard" element={<PatientDashboard />} />
        <Route path="/patient/risk" element={<MyRisk />} />
        <Route path="/patient/history" element={<MyHistory />} />
        <Route path="/patient/care-plan" element={<CarePlan />} />
      </Route>

      {/* Admin routes */}
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/analytics" element={<Analytics />} />
        <Route path="/admin/users" element={<Users />} />
        <Route path="/admin/model-monitor" element={<ModelMonitor />} />
      </Route>

      {/* Shared protected routes (available to any authenticated user) */}
      <Route element={<ProtectedRoute allowedRoles={['doctor', 'patient', 'admin']} />}>
        <Route path="/profile" element={<Profile />} />
        <Route path="/model-card" element={<ModelCard />} />
      </Route>

      {/* 404 fallback */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
