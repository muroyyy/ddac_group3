import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface UserData {
  email: string;
  name: string;
  role: string;
}

interface AuthSession {
  user: UserData;
  loginTime: number;
  expiresAt: number;
}

interface AuthContextType {
  user: UserData | null;
  isAuthenticated: boolean;
  login: (userData: UserData) => void;
  logout: () => void;
  isSessionExpired: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_DURATION = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
const STORAGE_KEY = 'bloodline_session';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserData | null>(null);

  const isSessionExpired = (): boolean => {
    const session = getStoredSession();
    if (!session) return true;
    return Date.now() > session.expiresAt;
  };

  const getStoredSession = (): AuthSession | null => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return null;
      return JSON.parse(stored);
    } catch {
      return null;
    }
  };

  const saveSession = (userData: UserData): void => {
    const session: AuthSession = {
      user: userData,
      loginTime: Date.now(),
      expiresAt: Date.now() + SESSION_DURATION
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  };

  const clearSession = (): void => {
    localStorage.removeItem(STORAGE_KEY);
    // Also clear old storage key for backward compatibility
    localStorage.removeItem('bloodline_user');
  };

  const login = (userData: UserData): void => {
    setUser(userData);
    saveSession(userData);
  };

  const logout = (): void => {
    setUser(null);
    clearSession();
  };

  // Check session on mount and set up auto-logout
  useEffect(() => {
    const checkSession = () => {
      const session = getStoredSession();
      
      if (!session) {
        setUser(null);
        return;
      }

      if (isSessionExpired()) {
        logout();
        return;
      }

      setUser(session.user);
    };

    // Check session immediately
    checkSession();

    // Set up periodic session checks (every minute)
    const interval = setInterval(checkSession, 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  // Set up automatic logout warning
  useEffect(() => {
    if (!user) return;

    const session = getStoredSession();
    if (!session) return;

    const timeUntilExpiry = session.expiresAt - Date.now();
    const warningTime = 5 * 60 * 1000; // 5 minutes before expiry

    if (timeUntilExpiry <= warningTime) return;

    const warningTimeout = setTimeout(() => {
      const shouldExtend = window.confirm(
        'Your session will expire in 5 minutes. Do you want to extend your session?'
      );
      
      if (shouldExtend) {
        // Extend session by logging in again with current user data
        login(user);
      }
    }, timeUntilExpiry - warningTime);

    return () => clearTimeout(warningTimeout);
  }, [user]);

  const value: AuthContextType = {
    user,
    isAuthenticated: user !== null && !isSessionExpired(),
    login,
    logout,
    isSessionExpired
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};