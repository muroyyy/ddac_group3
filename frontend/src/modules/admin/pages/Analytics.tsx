import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Activity, Heart } from 'lucide-react';
// Placeholder components for charts
const ResponsiveContainer = ({ children }: any) => <div className="w-full h-full">{children}</div>;
const LineChart = () => <div className="bg-gray-100 rounded p-4 text-center">Line Chart Placeholder</div>;
const PieChart = () => <div className="bg-gray-100 rounded p-4 text-center">Pie Chart Placeholder</div>;
const BarChart = () => <div className="bg-gray-100 rounded p-4 text-center">Bar Chart Placeholder</div>;
import { analyticsAPI } from '../services/analyticsAPI';
import type { AnalyticsOverview } from '../services/analyticsAPI';

const Analytics: React.FC = () => {
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const overviewData = await analyticsAPI.getOverview();
        setOverview(overviewData);
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-200 h-32 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">System Analytics</h2>
        <p className="text-gray-600">Real-time insights and performance metrics</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-3xl font-bold text-gray-900">{overview?.totalUsers || 0}</p>
            </div>
            <Users className="w-12 h-12 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-3xl font-bold text-green-600">{overview?.activeUsers || 0}</p>
            </div>
            <Activity className="w-12 h-12 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Donors</p>
              <p className="text-3xl font-bold text-red-600">{overview?.totalDonors || 0}</p>
            </div>
            <Heart className="w-12 h-12 text-red-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">New Today</p>
              <p className="text-3xl font-bold text-purple-600">{overview?.newUsersToday || 0}</p>
            </div>
            <UserPlus className="w-12 h-12 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* User Growth Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">User Growth (Last 30 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart />
          </ResponsiveContainer>
        </div>

        {/* User Distribution Pie Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">User Distribution by Role</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart />
          </ResponsiveContainer>
        </div>
      </div>

      {/* Blood Type Distribution */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Blood Type Distribution (Donors)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart />
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Analytics;