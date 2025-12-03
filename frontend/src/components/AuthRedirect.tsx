import React from 'react';
import { Navigate } from 'react-router-dom';
import { sessionManager } from '../utils/sessionManager';

interface AuthRedirectProps {
  children: React.ReactNode;
}

const AuthRedirect: React.FC<AuthRedirectProps> = ({ children }) => {
  const user = sessionManager.getUser();

  if (user) {
    const roleRoutes: Record<string, string> = {
      'admin': '/admin/dashboard',
      'donor': '/donor/dashboard',
      'patient': '/patient/dashboard',
      'hospital': '/hospital/dashboard'
    };
    
    const targetRoute = roleRoutes[user.role] || '/dashboard';
    return <Navigate to={targetRoute} replace />;
  }

  return <>{children}</>;
};

export default AuthRedirect;