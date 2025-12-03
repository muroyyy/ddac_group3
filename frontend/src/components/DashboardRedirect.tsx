import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface DashboardRedirectProps {
  children: React.ReactNode;
}

const DashboardRedirect: React.FC<DashboardRedirectProps> = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (isAuthenticated && user) {
    const roleRoutes: Record<string, string> = {
      'admin': '/admin/dashboard',
      'donor': '/donor/dashboard',
      'patient': '/patient/dashboard',
      'hospital': '/hospital/dashboard'
    };

    const targetRoute = roleRoutes[user.role];
    if (targetRoute) {
      return <Navigate to={targetRoute} replace />;
    }
  }

  return <>{children}</>;
};

export default DashboardRedirect;