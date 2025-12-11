import React, { useEffect, useState } from 'react';
import { sessionManager } from '../utils/sessionManager';
import { useAuth } from '../context/AuthContext';

interface SessionProviderProps {
  children: React.ReactNode;
}

const SessionProvider: React.FC<SessionProviderProps> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const { login } = useAuth();

  useEffect(() => {
    const restoreSession = () => {
      const user = sessionManager.getUser();
      const token = sessionManager.getToken();
      
      if (user && token) {
        login(user);
      }
      
      setIsInitialized(true);
    };

    restoreSession();

    // Listen for storage changes (logout from another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'bloodline_session' && !e.newValue) {
        // Session was cleared in another tab
        window.location.reload();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [login]);

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default SessionProvider;