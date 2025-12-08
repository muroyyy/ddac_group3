import { useEffect, useState } from 'react';
import { Bell, CheckCircle, Clock, XCircle, Info } from "lucide-react";
import { useAuth } from '../../../context/AuthContext';

interface Notification {
  id: number;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  appointmentId?: number;
}

export default function Notifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (user?.id) {
        try {
          const response = await fetch(`https://bloodline.dev/api/notifications?userId=${user.id}`);
          const data = await response.json();
          setNotifications(data);
        } catch (error) {
          console.error('Failed to fetch notifications:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchNotifications();
  }, [user?.id]);

  const markAsRead = async (notificationId: number) => {
    try {
      await fetch(`https://bloodline.dev/api/notifications/${notificationId}/read`, {
        method: 'PUT'
      });
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const typeStyles: any = {
    Alert: {
      icon: XCircle,
      border: "border-red-500",
      bg: "bg-red-50",
      text: "text-red-700",
    },
    Reminder: {
      icon: CheckCircle,
      border: "border-green-500",
      bg: "bg-green-50",
      text: "text-green-700",
    },
    System: {
      icon: Info,
      border: "border-blue-500",
      bg: "bg-blue-50",
      text: "text-blue-700",
    },
  };

  if (loading) {
    return <div className="p-4">Loading notifications...</div>;
  }

  return (
    <div className="space-y-6">
      
      {/* PAGE HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Bell className="w-6 h-6 text-red-600" />
          Notifications
        </h1>
        <p className="text-gray-600">
          Stay updated with your request status.
        </p>
      </div>

      {/* NOTIFICATION CARDS */}
      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No notifications yet
          </div>
        ) : (
          notifications.map((n) => {
            const Style = typeStyles[n.type] || typeStyles.System;
            const Icon = Style.icon;

            return (
              <div
                key={n.id}
                className={`flex items-start justify-between border-l-4 ${Style.border} 
                rounded-lg p-4 shadow-sm ${Style.bg} ${!n.isRead ? 'ring-2 ring-blue-200' : ''} cursor-pointer`}
                onClick={() => !n.isRead && markAsRead(n.id)}
              >
                {/* LEFT SIDE CONTENT */}
                <div className="flex gap-3 items-start">
                  
                  {/* Status Icon */}
                  <Icon className={`w-6 h-6 ${Style.text}`} />

                  {/* Text */}
                  <div>
                    <p className={`font-medium ${!n.isRead ? 'text-gray-900' : 'text-gray-600'}`}>
                      {n.message}
                    </p>
                    <p className="text-sm mt-1">
                      <span className={`font-semibold ${Style.text}`}>
                        Type: {n.type}
                      </span>
                      {!n.isRead && (
                        <span className="ml-2 text-xs bg-blue-500 text-white px-2 py-1 rounded">
                          New
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {/* TIMESTAMP */}
                <div className="text-sm text-gray-600 whitespace-nowrap">
                  {new Date(n.createdAt).toLocaleString()}
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
