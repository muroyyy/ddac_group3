import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';
import DonorLayout from './layouts/DonorLayout';

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
import PendingRequests from './modules/donor/pages/PendingRequests';
import AppointmentsTable from './modules/donor/pages/AppointmentsTable';

// Patient Routes removed

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
            <Route path="pending-requests" element={<PendingRequests />} />
            <Route path="appointments" element={<AppointmentsTable />} />
          </Route>
          
          {/* Patient routes removed */}
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