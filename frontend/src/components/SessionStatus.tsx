import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const SessionStatus: React.FC = () => {
  const { user, logout } = useAuth();
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isExpiringSoon, setIsExpiringSoon] = useState(false);

  useEffect(() => {
    if (!user) return;

    const updateTimer = () => {
      const session = localStorage.getItem('bloodline_session');
      if (!session) return;

      try {
        const { expiresAt } = JSON.parse(session);
        const now = Date.now();
        const remaining = expiresAt - now;

        if (remaining <= 0) {
          logout();
          return;
        }

        const hours = Math.floor(remaining / (1000 * 60 * 60));
        const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
        
        setTimeLeft(`${hours}h ${minutes}m`);
        setIsExpiringSoon(remaining < 15 * 60 * 1000); // 15 minutes
      } catch {
        logout();
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [user, logout]);

  if (!user) return null;

  return (
    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs ${
      isExpiringSoon 
        ? 'bg-red-100 text-red-700' 
        : 'bg-gray-100 text-gray-600'
    }`}>
      {isExpiringSoon ? (
        <AlertTriangle className="w-3 h-3" />
      ) : (
        <Clock className="w-3 h-3" />
      )}
      <span>Session: {timeLeft}</span>
    </div>
  );
};

export default SessionStatus;