import React from 'react';
import { BrowserRouter as Router, useRoutes, Navigate, Outlet } from 'react-router-dom';

// Context & Components
import { AuthProvider, useAuth } from './context/AuthContext';
import LoadingSpinner from './components/LoadingSpinner';
import ProtectedRoute from './components/ProtectedRoute';

// Route Modules
import { getAuthRoutes } from './routes/authRoutes';
import { getPublicRoutes } from './routes/publicRoutes';
import { getPatientRoutes } from './routes/patientRoutes';
import { getDonorRoutes } from './routes/donorRoutes';
import { getHospitalRoutes } from './routes/hospitalRoutes';
import { getAdminRoutes } from './routes/adminRoutes';

const AppRoutes: React.FC = () => {
  const { user, isLoading, login, logout } = useAuth();

  const routes = useRoutes([
    // Auth Routes (no layout)
    ...getAuthRoutes(login),

    // Public Routes
    ...getPublicRoutes(),

    // Protected Routes
    {
      element: <ProtectedRoute><Outlet /></ProtectedRoute>,
      children: [
        // Patient Routes
        getPatientRoutes(),

        // Admin Routes
        getAdminRoutes(user, logout),

        // Donor Routes
        getDonorRoutes(),

        // Hospital Routes - Role Protected
        getHospitalRoutes(user)
      ]
    },

    // Fallback Route
    { path: '*', element: <Navigate to="/" replace /> }
  ]);

  if (isLoading) return <LoadingSpinner />;

  return routes;
};

const App: React.FC = () => (
  <AuthProvider>
    <Router>
      <AppRoutes />
    </Router>
  </AuthProvider>
);

export default App;