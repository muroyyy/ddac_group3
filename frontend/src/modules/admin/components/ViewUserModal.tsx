import React, { useState, useEffect } from 'react';
import { X, User, Mail, Phone, Calendar, Shield, Activity } from 'lucide-react';
import { adminAPI } from '../services/adminAPI';
import type { User as UserType } from '../services/adminAPI';

interface ViewUserModalProps {
  userId: number;
  isOpen: boolean;
  onClose: () => void;
}

const ViewUserModal: React.FC<ViewUserModalProps> = ({ userId, isOpen, onClose }) => {
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && userId) {
      loadUser();
    }
  }, [isOpen, userId]);

  const loadUser = async () => {
    setLoading(true);
    try {
      const userData = await adminAPI.getUser(userId);
      if (userData) {
        setUser(userData);
      }
    } catch (error) {
      console.error('Failed to load user:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      Admin: 'bg-gray-100 text-gray-800',
      Donor: 'bg-green-100 text-green-800',
      Patient: 'bg-blue-100 text-blue-800',
      Hospital: 'bg-purple-100 text-purple-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    return status === 'Active' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">User Details</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 border-2 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading user details...</p>
          </div>
        ) : user ? (
          <div className="p-6">
            {/* User Avatar and Basic Info */}
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200">
              <div className="w-20 h-20 rounded-full bg-red-600 flex items-center justify-center text-white text-2xl font-bold">
                {user.fullName.charAt(0)}
              </div>
              <div className="flex-1">
                <h4 className="text-2xl font-bold text-gray-900">{user.fullName}</h4>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                    {user.role}
                  </span>
                  <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.status)}`}>
                    {user.status}
                  </span>
                </div>
              </div>
            </div>

            {/* User Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-1">
                    <Mail className="w-4 h-4" />
                    Email Address
                  </label>
                  <p className="text-gray-900 font-medium">{user.email}</p>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-1">
                    <Phone className="w-4 h-4" />
                    Phone Number
                  </label>
                  <p className="text-gray-900 font-medium">{user.phone || 'Not provided'}</p>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-1">
                    <Shield className="w-4 h-4" />
                    User Role
                  </label>
                  <p className="text-gray-900 font-medium">{user.role}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-1">
                    <Activity className="w-4 h-4" />
                    Account Status
                  </label>
                  <p className="text-gray-900 font-medium">{user.status}</p>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-1">
                    <Calendar className="w-4 h-4" />
                    Member Since
                  </label>
                  <p className="text-gray-900 font-medium">{formatDate(user.createdAt)}</p>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-1">
                    <User className="w-4 h-4" />
                    User ID
                  </label>
                  <p className="text-gray-900 font-medium">#{user.id}</p>
                </div>
              </div>
            </div>

            {/* Close Button */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={onClose}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer font-medium"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <div className="p-12 text-center">
            <p className="text-gray-600">User not found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewUserModal;
