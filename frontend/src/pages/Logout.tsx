import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { sessionManager } from '../utils/sessionManager';

const Logout: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Clear session
    sessionManager.clearSession();
    
    // Redirect to login page
    setTimeout(() => {
      navigate('/login', { replace: true });
    }, 1000);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Logging out...</p>
      </div>
    </div>
  );
};

export default Logout;