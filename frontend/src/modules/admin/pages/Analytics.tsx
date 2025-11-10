import React from 'react';
import { TrendingUp, BarChart3, PieChart, Activity } from 'lucide-react';

const Analytics: React.FC = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Analytics & Reports</h2>
        <p className="text-sm text-gray-500">System analytics and performance reports</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-8 h-8 text-blue-600" />
            <h3 className="text-lg font-semibold">User Growth</h3>
          </div>
          <p className="text-gray-600">Track user registration trends and growth patterns.</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="w-8 h-8 text-green-600" />
            <h3 className="text-lg font-semibold">Blood Donations</h3>
          </div>
          <p className="text-gray-600">Monitor blood donation statistics and trends.</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <PieChart className="w-8 h-8 text-purple-600" />
            <h3 className="text-lg font-semibold">Request Analytics</h3>
          </div>
          <p className="text-gray-600">Analyze blood request patterns and fulfillment rates.</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center py-12">
          <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics Dashboard</h3>
          <p className="text-gray-500 mb-4">Detailed analytics and reporting features coming soon.</p>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
            Configure Analytics
          </button>
        </div>
      </div>
    </div>
  );
};

export default Analytics;