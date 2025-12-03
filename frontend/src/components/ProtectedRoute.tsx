import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles = [], 
  redirectTo = '/login' 
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  console.log('🔒 ProtectedRoute checking auth:', { user, allowedRoles, isAuthenticated, isLoading });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    console.log('❌ No user found, redirecting to login');
    return <Navigate to={redirectTo} replace />;
  }

  // If no specific roles required, just check if authenticated
  if (allowedRoles.length === 0) {
    console.log('✅ No role restriction, user authenticated');
    return <>{children}</>;
  }

  // Check if user role is allowed
  const hasPermission = allowedRoles.includes(user.role);
  console.log('🎭 Role check:', { userRole: user.role, allowedRoles, hasPermission });
  
  if (!hasPermission) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;