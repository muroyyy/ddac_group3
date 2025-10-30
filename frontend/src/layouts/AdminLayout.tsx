import React, { useState } from 'react';
import { 
  Users, 
  Droplet, 
  Activity, 
  TrendingUp, 
  Server,
  Shield,
  Bell,
  FileText,
  Menu,
  X,
  LogOut,
  Moon,
  Sun
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

// Import admin components
import AdminDashboard from '../modules/admin/pages/Dashboard';
import UserManagement from '../modules/admin/pages/UserManagement';
import Analytics from '../modules/admin/pages/Analytics';
import Security from '../modules/admin/pages/Security';
import SystemMonitoring from '../modules/admin/pages/SystemMonitoring';
import BloodInventory from '../modules/admin/pages/BloodInventory';
import Notifications from '../modules/admin/pages/Notifications';
import AuditLogs from '../modules/admin/pages/AuditLogs';

interface AdminLayoutProps {
  user: {
    email: string;
    name: string;
    role: string;
  };
  onLogout: () => void;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ user, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const { isDark, toggleTheme } = useTheme();

  const navItems = [
    { id: 'dashboard', icon: <Activity className="w-5 h-5" />, label: 'Dashboard' },
    { id: 'users', icon: <Users className="w-5 h-5" />, label: 'User Management' },
    { id: 'analytics', icon: <TrendingUp className="w-5 h-5" />, label: 'Analytics & Reports' },
    { id: 'security', icon: <Shield className="w-5 h-5" />, label: 'Security & Compliance' },
    { id: 'monitoring', icon: <Server className="w-5 h-5" />, label: 'System Monitoring' },
    { id: 'inventory', icon: <Droplet className="w-5 h-5" />, label: 'Blood Inventory' },
    { id: 'notifications', icon: <Bell className="w-5 h-5" />, label: 'Notifications' },
    { id: 'audit', icon: <FileText className="w-5 h-5" />, label: 'Audit Logs' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <AdminDashboard user={user} onNavigate={setActiveTab} />;
      case 'users':
        return <UserManagement />;
      case 'analytics':
        return <Analytics />;
      case 'security':
        return <Security />;
      case 'monitoring':
        return <SystemMonitoring />;
      case 'inventory':
        return <BloodInventory />;
      case 'notifications':
        return <Notifications />;
      case 'audit':
        return <AuditLogs />;
      default:
        return <AdminDashboard user={user} onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-transform duration-300 ease-in-out`}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Droplet className="w-8 h-8 text-red-600" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">BloodLine</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden cursor-pointer">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <nav className="p-4 space-y-1 flex-1 overflow-y-auto" style={{ height: 'calc(100vh - 180px)' }}>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors cursor-pointer ${
                activeTab === item.id
                  ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 font-medium' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.role}</p>
            </div>
          </div>
          <div className="space-y-2">
            <button
              onClick={toggleTheme}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium cursor-pointer"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              <span>{isDark ? 'Light' : 'Dark'} Mode</span>
            </button>
            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/50 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/70 transition-colors font-medium cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden cursor-pointer"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {navItems.find(item => item.id === activeTab)?.label || 'Admin Dashboard'}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Welcome back, {user.name}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          {renderContent()}
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default AdminLayout;