import React, { useState } from 'react';
import { 
  Users, 
  Droplet, 
  Activity, 
  AlertTriangle, 
  TrendingUp, 
  Server,
  Shield,
  Bell,
  FileText,
  ChevronRight,
  Menu,
  X,
  LogOut
} from 'lucide-react';

interface AdminDashboardProps {
  user: {
    email: string;
    name: string;
    role: string;
  };
  onLogout: () => void;
}

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, icon, trend = 'neutral' }) => {
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
          <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
          {change && (
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

interface AlertItemProps {
  type: 'critical' | 'warning' | 'info';
  message: string;
  time: string;
}

const AlertItem: React.FC<AlertItemProps> = ({ type, message, time }) => {
  const alertStyles = {
    critical: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  };

  return (
    <div className={`p-4 rounded-lg border ${alertStyles[type]} mb-3`}>
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <p className="font-medium text-sm">{message}</p>
          <p className="text-xs opacity-75 mt-1">{time}</p>
        </div>
      </div>
    </div>
  );
};

interface ActivityItemProps {
  user: string;
  action: string;
  time: string;
  role: string;
}

const ActivityItem: React.FC<ActivityItemProps> = ({ user, action, time, role }) => {
  const roleColors: Record<string, string> = {
    Donor: 'bg-green-100 text-green-800',
    Patient: 'bg-blue-100 text-blue-800',
    Hospital: 'bg-purple-100 text-purple-800',
    Admin: 'bg-gray-100 text-gray-800'
  };

  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
        <Users className="w-5 h-5 text-gray-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">{user}</p>
        <p className="text-sm text-gray-600">{action}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className={`text-xs px-2 py-0.5 rounded-full ${roleColors[role]}`}>
            {role}
          </span>
          <span className="text-xs text-gray-500">{time}</span>
        </div>
      </div>
    </div>
  );
};

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const stats = [
    {
      title: 'Total Users',
      value: '2,847',
      change: '+12.5% from last month',
      icon: <Users className="w-6 h-6 text-blue-600" />,
      trend: 'up' as const
    },
    {
      title: 'Active Donors',
      value: '1,234',
      change: '+8.2% from last month',
      icon: <Droplet className="w-6 h-6 text-red-600" />,
      trend: 'up' as const
    },
    {
      title: 'Blood Requests',
      value: '156',
      change: '23 pending approval',
      icon: <Activity className="w-6 h-6 text-orange-600" />,
      trend: 'neutral' as const
    },
    {
      title: 'System Health',
      value: '99.8%',
      change: 'All services operational',
      icon: <Server className="w-6 h-6 text-green-600" />,
      trend: 'up' as const
    }
  ];

  const alerts = [
    {
      type: 'critical' as const,
      message: 'Critical: O- blood type low stock at General Hospital',
      time: '5 minutes ago'
    },
    {
      type: 'warning' as const,
      message: 'Warning: High CPU usage detected on EC2 instance',
      time: '1 hour ago'
    },
    {
      type: 'info' as const,
      message: 'Info: Scheduled maintenance on RDS at 2:00 AM',
      time: '3 hours ago'
    }
  ];

  const recentActivities = [
    {
      user: 'John Doe',
      action: 'Registered as a new donor',
      time: '2 mins ago',
      role: 'Donor'
    },
    {
      user: 'Sarah Chen',
      action: 'Requested B+ blood type',
      time: '15 mins ago',
      role: 'Patient'
    },
    {
      user: 'City Hospital',
      action: 'Updated blood inventory',
      time: '30 mins ago',
      role: 'Hospital'
    },
    {
      user: 'Dr. Ahmad',
      action: 'Approved donation request',
      time: '1 hour ago',
      role: 'Hospital'
    }
  ];

  const bloodInventory = [
    { type: 'A+', units: 145, status: 'good' },
    { type: 'A-', units: 67, status: 'good' },
    { type: 'B+', units: 98, status: 'good' },
    { type: 'B-', units: 34, status: 'warning' },
    { type: 'O+', units: 187, status: 'good' },
    { type: 'O-', units: 12, status: 'critical' },
    { type: 'AB+', units: 45, status: 'warning' },
    { type: 'AB-', units: 23, status: 'warning' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const navItems = [
    { icon: <Activity className="w-5 h-5" />, label: 'Dashboard', active: true },
    { icon: <Users className="w-5 h-5" />, label: 'User Management' },
    { icon: <TrendingUp className="w-5 h-5" />, label: 'Analytics & Reports' },
    { icon: <Shield className="w-5 h-5" />, label: 'Security & Compliance' },
    { icon: <Server className="w-5 h-5" />, label: 'System Monitoring' },
    { icon: <Droplet className="w-5 h-5" />, label: 'Blood Inventory' },
    { icon: <Bell className="w-5 h-5" />, label: 'Notifications' },
    { icon: <FileText className="w-5 h-5" />, label: 'Audit Logs' }
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out`}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Droplet className="w-8 h-8 text-red-600" />
            <span className="text-xl font-bold text-gray-900">BloodLine</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden cursor-pointer">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <nav className="p-4 space-y-1 flex-1 overflow-y-auto" style={{ height: 'calc(100vh - 180px)' }}>
          {navItems.map((item, index) => (
            <button
              key={index}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors cursor-pointer ${
                item.active 
                  ? 'bg-blue-50 text-blue-600 font-medium' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
              <p className="text-xs text-gray-500 truncate">{user.role}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden cursor-pointer"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-500">Welcome back, {user.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer">
                <Bell className="w-6 h-6" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <button
                onClick={onLogout}
                className="hidden md:flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {stats.map((stat, index) => (
              <StatCard key={index} {...stat} />
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
                {alerts.map((alert, index) => (
                  <AlertItem key={index} {...alert} />
                ))}
              </div>
            </div>

            {/* Blood Inventory Summary */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Blood Inventory</h2>
              <div className="space-y-3">
                {bloodInventory.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(item.status)}`}></div>
                      <span className="font-medium text-gray-900">{item.type}</span>
                    </div>
                    <span className="text-sm text-gray-600">{item.units} units</span>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium cursor-pointer">
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
              {recentActivities.map((activity, index) => (
                <ActivityItem key={index} {...activity} />
              ))}
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden cursor-pointer"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default AdminDashboard;