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
      try {
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
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        // Clear session on any error
        sessionManager.clearSession();
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
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
    try {
      await sessionAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const refreshSession = async () => {
    try {
      const result = await sessionAPI.refreshToken();
      if (result.success && result.token && user) {
        sessionManager.setSession(user, result.token);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Session refresh failed:', error);
      return false;
    }
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