import { useEffect, useState } from 'react';
import { Bell, CheckCircle, XCircle, Info, Calendar } from "lucide-react";
import { useAuth } from '../../../context/AuthContext';
import { patientAPI } from '../../../utils/apiClient';

interface Notification {
  id: number;
  title: string;
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
      if (!user?.id) {
        console.log('No user ID found');
        setLoading(false);
        return;
      }
      
      console.log('Fetching notifications for user:', user.id);
      try {
        const result = await patientAPI.getNotifications(user.id);
        console.log('Notification API result:', result);
        
        if (result.success) {
          console.log('Setting notifications:', result.data);
          setNotifications(result.data);
        } else {
          console.error('API returned success=false:', result);
        }
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [user?.id]);

  const markAsRead = async (notificationId: number) => {
    try {
      const result = await patientAPI.markNotificationRead(notificationId);
      if (result.success) {
        setNotifications(prev => 
          prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
        );
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const typeStyles: any = {
    appointment_update: {
      icon: Calendar,
      border: "border-blue-500",
      bg: "bg-blue-50",
      text: "text-blue-700",
    },
    blood_request_update: {
      icon: CheckCircle,
      border: "border-green-500",
      bg: "bg-green-50",
      text: "text-green-700",
    },
    blood_request_submitted: {
      icon: CheckCircle,
      border: "border-blue-500",
      bg: "bg-blue-50",
      text: "text-blue-700",
    },
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
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Bell className="w-6 h-6 text-red-600" />
            Notifications
          </h1>
          <p className="text-gray-600">
            Stay updated with your request status.
          </p>
        </div>
        <button
          onClick={async () => {
            if (user?.id) {
              try {
                console.log('Creating test notification for user:', user.id);
                const result = await patientAPI.createTestNotification(user.id);
                console.log('Test notification result:', result);
                
                if (result.success) {
                  alert('Test notification created! Refreshing page...');
                  window.location.reload();
                } else {
                  alert('Failed to create test notification: ' + result.message);
                }
              } catch (error) {
                console.error('Failed to create test notification:', error);
                alert('Error creating test notification: ' + error);
              }
            } else {
              alert('No user ID found');
            }
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
        >
          Create Test
        </button>
      </div>

      {/* DEBUG INFO */}
      <div className="bg-gray-100 p-4 rounded-lg text-sm">
        <strong>Debug Info:</strong><br/>
        User ID: {user?.id || 'Not found'}<br/>
        Loading: {loading.toString()}<br/>
        Notifications count: {notifications.length}<br/>
        Notifications data: {JSON.stringify(notifications, null, 2)}
      </div>

      {/* NOTIFICATION CARDS */}
      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No notifications yet - Click "Create Test" to add one
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
                    <h3 className={`font-semibold ${!n.isRead ? 'text-gray-900' : 'text-gray-600'}`}>
                      {n.title}
                    </h3>
                    <p className={`text-sm mt-1 ${!n.isRead ? 'text-gray-700' : 'text-gray-500'}`}>
                      {n.message}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-xs px-2 py-1 rounded ${Style.bg} ${Style.text} font-medium`}>
                        {n.type.replace('_', ' ').toUpperCase()}
                      </span>
                      {!n.isRead && (
                        <span className="text-xs bg-red-500 text-white px-2 py-1 rounded">
                          New
                        </span>
                      )}
                    </div>
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
