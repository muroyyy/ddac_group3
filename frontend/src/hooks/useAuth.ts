import { useState, useEffect } from 'react';
import { sessionManager } from '../utils/sessionManager';
import { sessionAPI } from '../api';

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      const currentUser = sessionManager.getUser();
      
      if (currentUser) {
        // Validate token with backend
        const validation = await sessionAPI.validateToken();
        
        if (validation.valid) {
          setUser(currentUser);
          setIsAuthenticated(true);
        } else {
          sessionManager.clearSession();
          setUser(null);
          setIsAuthenticated(false);
        }
      }
      
      setIsLoading(false);
    };

    initAuth();

    // Check for session expiration every minute
    const interval = setInterval(() => {
      if (!sessionManager.isAuthenticated()) {
        setUser(null);
        setIsAuthenticated(false);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const login = (userData: User, token: string) => {
    sessionManager.setSession(userData, token);
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    await sessionAPI.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  const refreshSession = async () => {
    const result = await sessionAPI.refreshToken();
    if (result.success && result.token && user) {
      sessionManager.setSession(user, result.token);
      return true;
    }
    return false;
  };

  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    refreshSession,
    isExpiringSoon: sessionManager.isExpiringSoon(),
  };
};