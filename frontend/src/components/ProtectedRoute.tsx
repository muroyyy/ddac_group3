import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { sessionManager } from '../utils/sessionManager';

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
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const user = sessionManager.getUser();
      
      console.log('🔒 ProtectedRoute checking auth:', { user, allowedRoles });
      
      if (!user) {
        console.log('❌ No user found, redirecting to login');
        setIsAuthorized(false);
        setIsChecking(false);
        return;
      }

      // If no specific roles required, just check if authenticated
      if (allowedRoles.length === 0) {
        console.log('✅ No role restriction, user authenticated');
        setIsAuthorized(true);
        setIsChecking(false);
        return;
      }

      // Check if user role is allowed
      const hasPermission = allowedRoles.includes(user.role);
      console.log('🎭 Role check:', { userRole: user.role, allowedRoles, hasPermission });
      setIsAuthorized(hasPermission);
      setIsChecking(false);
    };

    // Small delay to ensure session is set
    const timer = setTimeout(checkAuth, 100);
    return () => clearTimeout(timer);
  }, [allowedRoles]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!isAuthorized) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;