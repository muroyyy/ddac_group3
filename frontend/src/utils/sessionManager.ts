interface UserData {
  id: number;
  email: string;
  name: string;
  role: string;
}

interface UserSession extends UserData {
  token: string;
  expiresAt: number;
}

const SESSION_KEY = 'bloodline_session';
const TOKEN_KEY = 'bloodline_token';

export const sessionManager = {
  // Store user session
  setSession: (user: UserData, token: string, expiresInHours = 24) => {
    const expiresAt = Date.now() + (expiresInHours * 60 * 60 * 1000);
    const session: UserSession = { ...user, token, expiresAt };
    
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    localStorage.setItem(TOKEN_KEY, token);
  },

  // Get current session
  getSession: (): UserSession | null => {
    try {
      const sessionData = localStorage.getItem(SESSION_KEY);
      if (!sessionData) return null;

      const session: UserSession = JSON.parse(sessionData);
      
      // Check if session is expired
      if (Date.now() > session.expiresAt) {
        sessionManager.clearSession();
        return null;
      }

      return session;
    } catch {
      sessionManager.clearSession();
      return null;
    }
  },

  // Get token
  getToken: (): string | null => {
    const session = sessionManager.getSession();
    return session?.token || null;
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return sessionManager.getSession() !== null;
  },

  // Clear session
  clearSession: () => {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(TOKEN_KEY);
  },

  // Get user data
  getUser: (): UserData | null => {
    const session = sessionManager.getSession();
    if (!session) return null;
    
    const { token, expiresAt, ...user } = session;
    return user;
  },

  // Check if session expires soon (within 1 hour)
  isExpiringSoon: (): boolean => {
    const session = sessionManager.getSession();
    if (!session) return false;
    
    const oneHour = 60 * 60 * 1000;
    return (session.expiresAt - Date.now()) < oneHour;
  }
};