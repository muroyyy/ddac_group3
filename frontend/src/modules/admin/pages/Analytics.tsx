import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Activity, Heart } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { analyticsAPI } from '../services/analyticsAPI';
import type { AnalyticsOverview, UserGrowthData, UserDistribution, BloodTypeDistribution } from '../services/analyticsAPI';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

const Analytics: React.FC = () => {
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [userGrowth, setUserGrowth] = useState<UserGrowthData[]>([]);
  const [userDistribution, setUserDistribution] = useState<UserDistribution[]>([]);
  const [bloodTypeDistribution, setBloodTypeDistribution] = useState<BloodTypeDistribution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [overviewData, growthData, distributionData, bloodTypeData] = await Promise.all([
          analyticsAPI.getOverview(),
          analyticsAPI.getUserGrowth(),
          analyticsAPI.getUserDistribution(),
          analyticsAPI.getBloodTypeDistribution()
        ]);
        
        setOverview(overviewData);
        setUserGrowth(growthData);
        setUserDistribution(distributionData);
        setBloodTypeDistribution(bloodTypeData);
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
            <LineChart data={userGrowth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#3B82F6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* User Distribution Pie Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">User Distribution by Role</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={userDistribution as any[]}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ role, percent }: any) => `${role} ${((percent as number) * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {userDistribution.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Blood Type Distribution */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Blood Type Distribution (Donors)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={bloodTypeDistribution}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="bloodType" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#EF4444" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Analytics;