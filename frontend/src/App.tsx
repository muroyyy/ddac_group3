import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';
import DonorLayout from './layouts/DonorLayout';
import HospitalLayout from './layouts/HospitalLayout';
import PatientLayout from './layouts/PatientLayout';

// Pages
import LandingPage from './layouts/Landing';
import LoginPage from './layouts/Login';
import RegisterPage from './layouts/Register';
import ForgotPassword from './layouts/ForgotPassword';
import ResetPassword from './layouts/ResetPassword';
import MockEmail from './layouts/MockEmail';
import Unauthorized from './layouts/Unauthorized';

// Patient Pages
import PatientDashboard from './modules/patient/pages/Dashboard';
import RequestBlood from './modules/patient/pages/RequestBlood';
import ViewRequests from './modules/patient/pages/ViewRequests';
import Appointments from './modules/patient/pages/Appointments';
import PatientProfile from './modules/patient/pages/Profile';
import EditProfile from './modules/patient/pages/EditProfile';
import Notifications from './modules/patient/pages/Notifications';
import Insights from './modules/patient/pages/Insights';
import Logout from './modules/patient/pages/Logout';

// Donor Pages
import DonorDashboard from './modules/donor/pages/DonorDashboard';
import DonateBloodForm from './modules/donor/pages/DonateBloodForm';
import DonationHistory from './modules/donor/pages/DonationHistory';
import DonorProfile from './modules/donor/pages/DonorProfile';
import PendingRequests from './modules/donor/pages/PendingRequests';
import AppointmentsTable from './modules/donor/pages/AppointmentsTable';
import CompletedDonations from './modules/donor/pages/CompletedDonations';
import HospitalDashboard from './modules/hospital/pages/HospitalDashboard';
import Inventory from './modules/hospital/pages/Inventory';
import Approvals from './modules/hospital/pages/Approvals';
import HospitalProfile from './modules/hospital/pages/Profile';

// Context & Components
import { AuthProvider, useAuth } from './context/AuthContext';
import LoadingSpinner from './components/LoadingSpinner';
import ProtectedRoute from './components/ProtectedRoute';
import RoleProtected from './routes/ProtectedRoutes';

const AppRoutes: React.FC = () => {
  const { user, isLoading, login, logout } = useAuth();

  if (isLoading) return <LoadingSpinner />;

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage onLogin={login} />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/mock-email" element={<MockEmail />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
        </Route>

        {/* Protected Routes */}
        <Route element={<ProtectedRoute><Outlet /></ProtectedRoute>}>
          {/* Patient Routes */}
          <Route path="/patient" element={<PatientLayout />}>
            <Route index element={<Navigate to="/patient/dashboard" replace />} />
            <Route path="dashboard" element={<PatientDashboard />} />
            <Route path="request-blood" element={<RequestBlood />} />
            <Route path="view-requests" element={<ViewRequests />} />
            <Route path="appointments" element={<Appointments />} />
            <Route path="profile" element={<PatientProfile />} />
            <Route path="edit-profile" element={<EditProfile />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="insights" element={<Insights />} />
            <Route path="logout" element={<Logout />} />
          </Route>

          <Route path="/admin/dashboard" element={<AdminLayout user={user!} onLogout={logout} />} />

          <Route path="/donor" element={<DonorLayout />}>
            <Route index element={<Navigate to="/donor/dashboard" replace />} />
            <Route path="dashboard" element={<DonorDashboard />} />
            <Route path="donate" element={<DonateBloodForm />} />
            <Route path="history" element={<DonationHistory />} />
            <Route path="profile" element={<DonorProfile />} />
            <Route path="pending-requests" element={<PendingRequests />} />
            <Route path="appointments" element={<AppointmentsTable />} />
            <Route path="completed-donations" element={<CompletedDonations />} />
          </Route>

          {/* Hospital routes - role protected */}
          <Route element={<RoleProtected requiredRole="hospital" />}>
            <Route path="/hospital" element={<HospitalLayout />}>
              <Route index element={<Navigate to="/hospital/dashboard" replace />} />
              <Route path="dashboard" element={<HospitalDashboard user={user!} />} />
              <Route path="inventory" element={<Inventory />} />
              <Route path="approvals" element={<Approvals />} />
              <Route path="profile" element={<HospitalProfile />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

const App: React.FC = () => (
  <AuthProvider>
    <AppRoutes />
  </AuthProvider>
);

export default App;