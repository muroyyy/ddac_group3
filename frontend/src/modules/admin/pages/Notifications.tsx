import React from 'react';
import { Bell, Mail, MessageSquare, Settings } from 'lucide-react';

const Notifications: React.FC = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Notifications</h2>
        <p className="text-sm text-gray-500">Manage system notifications and alerts</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="w-8 h-8 text-blue-600" />
            <h3 className="text-lg font-semibold">System Alerts</h3>
          </div>
          <p className="text-gray-600 mb-4">Configure system-wide alerts and notifications.</p>
          <button className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
            Configure
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <Mail className="w-8 h-8 text-green-600" />
            <h3 className="text-lg font-semibold">Email Notifications</h3>
          </div>
          <p className="text-gray-600 mb-4">Manage email notification settings and templates.</p>
          <button className="w-full py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer">
            Configure
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <MessageSquare className="w-8 h-8 text-purple-600" />
            <h3 className="text-lg font-semibold">SMS Alerts</h3>
          </div>
          <p className="text-gray-600 mb-4">Set up SMS notifications for critical alerts.</p>
          <button className="w-full py-2 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors cursor-pointer">
            Configure
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center py-12">
          <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Notification Center</h3>
          <p className="text-gray-500 mb-4">Advanced notification management features coming soon.</p>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
            Configure Notifications
          </button>
        </div>
      </div>
    </div>
  );
};

export default Notifications;