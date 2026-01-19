// Import necessary React hooks and icons for the notifications page
import { useEffect, useState } from 'react';
import { Bell, CheckCircle, XCircle, Info, Calendar } from "lucide-react";
import { useAuth } from '../../../context/AuthContext';
import { patientAPI } from '../../../api';

// Define the structure of a notification object - learned this pattern from React docs
interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  appointmentId?: number; // Optional field for appointment-related notifications
}

// Main notifications component - displays all patient notifications
export default function Notifications() {
  // Get current user from auth context
  const { user } = useAuth();
  // State to store notifications array
  const [notifications, setNotifications] = useState<Notification[]>([]);
  // Loading state to show spinner while fetching data
  const [loading, setLoading] = useState(true);

  // Fetch notifications when component mounts or user changes
  useEffect(() => {
    const fetchNotifications = async () => {
      // Don't fetch if no user is logged in
      if (!user?.id) return;
      try {
        // Call API to get user's notifications
        const result = await patientAPI.getNotifications(user.id);
        if (result.success) {
          // Update state with fetched notifications
          setNotifications(result.data);
        }
      } catch (error) {
        // Log any errors that occur during fetch
        console.error('Failed to fetch notifications:', error);
      } finally {
        // Always stop loading spinner regardless of success/failure
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [user?.id]); // Re-run effect when user ID changes

  // Function to mark a notification as read when user clicks on it
  const markAsRead = async (notificationId: number) => {
    try {
      // Call API to update notification status in database
      const result = await patientAPI.markNotificationRead(notificationId);
      if (result.success) {
        // Update local state to reflect the change immediately (optimistic update)
        // Using map to create new array with updated notification
        setNotifications(prev => 
          prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
        );
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  // Define styling for different notification types - makes UI more intuitive
  // Each type has its own color scheme and icon for better user experience
  const typeStyles: any = {
    Request: {
      icon: CheckCircle,
      border: "border-green-500",
      bg: "bg-green-50",
      text: "text-green-700",
    },
    Donation: {
      icon: CheckCircle,
      border: "border-blue-500",
      bg: "bg-blue-50",
      text: "text-blue-700",
    },
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
    'Urgent Alert': {
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

  // Show loading spinner while fetching data
  if (loading) {
    return <div className="p-4">Loading notifications...</div>;
  }

  return (
    <div className="space-y-6">
      
      {/* Page header with bell icon and description */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Bell className="w-6 h-6 text-red-600" />
          Notifications
        </h1>
        <p className="text-gray-600">
          Stay updated with your request status.
        </p>
      </div>

      {/* Main notification list container */}
      <div className="space-y-4">
        {notifications.length === 0 ? (
          // Show empty state when no notifications exist
          <div className="text-center py-8 text-gray-500">
            No notifications yet
          </div>
        ) : (
          // Map through notifications and render each one
          notifications.map((n) => {
            // Get styling based on notification type, fallback to System style
            const Style = typeStyles[n.type] || typeStyles.System;
            const Icon = Style.icon;

            return (
              <div
                key={n.id}
                // Dynamic classes based on notification state and type
                className={`flex items-start justify-between border-l-4 ${Style.border} 
                rounded-lg p-4 shadow-sm ${Style.bg} ${!n.isRead ? 'ring-2 ring-blue-200' : ''} cursor-pointer`}
                // Only allow marking as read if notification is unread
                onClick={() => !n.isRead && markAsRead(n.id)}
              >
                {/* Left side: icon and notification content */}
                <div className="flex gap-3 items-start">
                  
                  {/* Notification type icon */}
                  <Icon className={`w-6 h-6 ${Style.text}`} />

                  {/* Notification text content */}
                  <div>
                    {/* Title with different styling for read/unread */}
                    <h3 className={`font-semibold ${!n.isRead ? 'text-gray-900' : 'text-gray-600'}`}>
                      {n.title}
                    </h3>
                    {/* Message content */}
                    <p className={`text-sm mt-1 ${!n.isRead ? 'text-gray-700' : 'text-gray-500'}`}>
                      {n.message}
                    </p>
                    {/* Tags and badges */}
                    <div className="flex items-center gap-2 mt-2">
                      {/* Notification type badge */}
                      <span className={`text-xs px-2 py-1 rounded ${Style.bg} ${Style.text} font-medium`}>
                        {n.type.replace('_', ' ').toUpperCase()}
                      </span>
                      {/* "New" badge for unread notifications */}
                      {!n.isRead && (
                        <span className="text-xs bg-red-500 text-white px-2 py-1 rounded">
                          New
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right side: timestamp */}
                <div className="text-sm text-gray-600 whitespace-nowrap">
                  {/* Format date to local string for better readability */}
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
