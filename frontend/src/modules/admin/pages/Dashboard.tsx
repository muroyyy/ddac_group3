import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Droplet, 
  Activity, 
  Server,
  AlertTriangle,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import { adminAPI } from '../services/adminAPI';
import type { DashboardStats, SystemAlert, ActivityLog, BloodInventoryItem } from '../services/adminAPI';

interface AdminDashboardProps {
  user: {
    email: string;
    name: string;
    role: string;
  };
  onNavigate: (tab: string) => void;
}

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  loading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, icon, trend = 'neutral', loading }) => {
  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-gray-600'
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          {loading ? (
            <div className="w-16 h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
          ) : (
            <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
          )}
          {change && !loading && (
            <p className={`text-sm font-medium ${trendColors[trend]}`}>
              {change}
            </p>
          )}
        </div>
        <div className="p-3 bg-blue-50 rounded-lg">
          {icon}
        </div>
      </div>
    </div>
  );
};

const AlertItem: React.FC<SystemAlert> = ({ type, message, timestamp }) => {
  const alertStyles = {
    critical: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} minutes ago`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)} hours ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className={`p-4 rounded-lg border ${alertStyles[type]} mb-3`}>
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <p className="font-medium text-sm">{message}</p>
          <p className="text-xs opacity-75 mt-1">{formatTime(timestamp)}</p>
        </div>
      </div>
    </div>
  );
};

const ActivityItem: React.FC<ActivityLog> = ({ userName, action, timestamp, userRole }) => {
  const roleColors: Record<string, string> = {
    Donor: 'bg-green-100 text-green-800',
    Patient: 'bg-blue-100 text-blue-800',
    Hospital: 'bg-purple-100 text-purple-800',
    Admin: 'bg-gray-100 text-gray-800'
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} mins ago`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)} hours ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
        <Users className="w-5 h-5 text-gray-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">{userName}</p>
        <p className="text-sm text-gray-600">{action}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className={`text-xs px-2 py-0.5 rounded-full ${roleColors[userRole] || roleColors.Admin}`}>
            {userRole}
          </span>
          <span className="text-xs text-gray-500">{formatTime(timestamp)}</span>
        </div>
      </div>
    </div>
  );
};

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user: _, onNavigate }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [bloodInventory, setBloodInventory] = useState<BloodInventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [statsData, alertsData, activitiesData, inventoryData] = await Promise.all([
        adminAPI.getDashboardStats(),
        adminAPI.getSystemAlerts(),
        adminAPI.getActivityLogs(),
        adminAPI.getBloodInventory()
      ]);

      setStats(statsData);
      setAlerts(alertsData);
      setActivities(activitiesData);
      setBloodInventory(inventoryData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
  };

  useEffect(() => {
    loadData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const statsCards = [
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      change: '+12.5% from last month',
      icon: <Users className="w-6 h-6 text-blue-600" />,
      trend: 'up' as const
    },
    {
      title: 'Active Donors',
      value: stats?.activeDonors || 0,
      change: '+8.2% from last month',
      icon: <Droplet className="w-6 h-6 text-red-600" />,
      trend: 'up' as const
    },
    {
      title: 'Blood Requests',
      value: stats?.bloodRequests || 0,
      change: '23 pending approval',
      icon: <Activity className="w-6 h-6 text-orange-600" />,
      trend: 'neutral' as const
    },
    {
      title: 'System Health',
      value: stats?.systemHealth || 'Unknown',
      change: 'All services operational',
      icon: <Server className="w-6 h-6 text-green-600" />,
      trend: 'up' as const
    }
  ];

  return (
    <div className="p-6">
      {/* Header with Refresh */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Dashboard Overview</h2>
          <p className="text-sm text-gray-500">Real-time system metrics and activity</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {statsCards.map((stat, index) => (
          <StatCard key={index} {...stat} loading={loading} />
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Alerts */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">System Alerts</h2>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 cursor-pointer">
              View All
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
                ))}
              </div>
            ) : alerts.length > 0 ? (
              alerts.slice(0, 3).map((alert) => (
                <AlertItem key={alert.id} {...alert} />
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">No alerts at this time</p>
            )}
          </div>
        </div>

        {/* Blood Inventory Summary */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Blood Inventory</h2>
          <div className="space-y-3">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-6 bg-gray-200 rounded animate-pulse"></div>
                ))}
              </div>
            ) : bloodInventory.length > 0 ? (
              bloodInventory.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(item.status)}`}></div>
                    <span className="font-medium text-gray-900">{item.bloodType}</span>
                  </div>
                  <span className="text-sm text-gray-600">{item.units} units</span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No inventory data</p>
            )}
          </div>
          <button 
            onClick={() => onNavigate('inventory')}
            className="w-full mt-4 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium cursor-pointer"
          >
            View Full Inventory
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 cursor-pointer">
            View All
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : activities.length > 0 ? (
            activities.slice(0, 5).map((activity) => (
              <ActivityItem key={activity.id} {...activity} />
            ))
          ) : (
            <p className="text-gray-500 text-center py-8">No recent activity</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;