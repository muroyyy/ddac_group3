import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';
import DonorLayout from './layouts/DonorLayout';
import { DashboardLayout as PatientLayout } from './modules/patient/components/layout/DashboardLayout';

// Pages
import LandingPage from './layouts/Landing';
import LoginPage from './layouts/Login';
import RegisterPage from './layouts/Register';
import ForgotPassword from './layouts/ForgotPassword';
import ResetPassword from './layouts/ResetPassword';
import MockEmail from './layouts/MockEmail';

// Donor Pages
import DonorDashboard from './modules/donor/pages/DonorDashboard';
import DonateBloodForm from './modules/donor/pages/DonateBloodForm';
import DonationHistory from './modules/donor/pages/DonationHistory';
import DonorProfile from './modules/donor/pages/DonorProfile';

// Patient Pages
import PatientDashboard from './modules/patient/pages/Dashboard';
import RequestBlood from './modules/patient/pages/RequestBlood';
import ViewRequests from './modules/patient/pages/ViewRequests';
import PatientProfile from './modules/patient/pages/Profile';
import Appointments from './modules/patient/pages/Appointments';
import Notifications from './modules/patient/pages/Notifications';
import Insights from './modules/patient/pages/Insights';
import Logout from './modules/patient/pages/Logout';

// Context & Components
import { AuthProvider, useAuth } from './context/AuthContext';
import LoadingSpinner from './components/LoadingSpinner';
import ProtectedRoute from './components/ProtectedRoute';

const AppRoutes: React.FC = () => {
  const { user, isAuthenticated, isLoading, login, logout } = useAuth();

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
        </Route>

        {/* Protected Routes */}
        <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} />}>
          <Route path="/admin/dashboard" element={<AdminLayout user={user!} onLogout={logout} />} />
          
          <Route path="/donor" element={<DonorLayout />}>
            <Route index element={<Navigate to="/donor/dashboard" replace />} />
            <Route path="dashboard" element={<DonorDashboard />} />
            <Route path="donate" element={<DonateBloodForm />} />
            <Route path="history" element={<DonationHistory />} />
            <Route path="profile" element={<DonorProfile />} />
          </Route>
          
          <Route path="/patient" element={<PatientLayout />}>
            <Route index element={<Navigate to="/patient/dashboard" replace />} />
            <Route path="dashboard" element={<PatientDashboard />} />
            <Route path="request-blood" element={<RequestBlood />} />
            <Route path="view-requests" element={<ViewRequests />} />
            <Route path="appointments" element={<Appointments />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="insights" element={<Insights />} />
            <Route path="profile" element={<PatientProfile />} />
            <Route path="logout" element={<Logout />} />
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