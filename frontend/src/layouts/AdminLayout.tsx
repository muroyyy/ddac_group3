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
  CheckCircle,
  X,
  LogOut,
  Settings
} from 'lucide-react';
import bloodlineLogo from '../assets/bloodline_logo.svg';

// Import admin components
import AdminDashboard from '../modules/admin/pages/Dashboard';
import UserManagement from '../modules/admin/pages/UserManagement';
import Analytics from '../modules/admin/pages/Analytics';
import Security from '../modules/admin/pages/Security';
import SystemMonitoring from '../modules/admin/pages/SystemMonitoring';
import BloodInventory from '../modules/admin/pages/BloodInventory';
import Notifications from '../modules/admin/pages/Notifications';
import AuditLogs from '../modules/admin/pages/AuditLogs';
import ProfileSettings from '../modules/admin/pages/ProfileSettings';
import UserVerification from '../modules/admin/pages/UserVerification';
import SystemAlerts from '../modules/admin/pages/SystemAlerts';

interface AdminLayoutProps {
  user: {
    email: string;
    name: string;
    role: string;
  };
  onLogout: () => void;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ user, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const navItems = [
    { id: 'dashboard', icon: <Activity className="w-5 h-5" />, label: 'Dashboard' },
    { id: 'users', icon: <Users className="w-5 h-5" />, label: 'User Management' },
    { id: 'verification', icon: <CheckCircle className="w-5 h-5" />, label: 'User Verification' },
    { id: 'alerts', icon: <Bell className="w-5 h-5" />, label: 'System Alerts' },
    { id: 'analytics', icon: <TrendingUp className="w-5 h-5" />, label: 'Analytics & Reports' },
    { id: 'security', icon: <Shield className="w-5 h-5" />, label: 'Security & Compliance' },
    { id: 'monitoring', icon: <Server className="w-5 h-5" />, label: 'System Monitoring' },
    { id: 'inventory', icon: <Droplet className="w-5 h-5" />, label: 'Blood Inventory' },
    { id: 'notifications', icon: <Bell className="w-5 h-5" />, label: 'Notifications' },
    { id: 'audit', icon: <FileText className="w-5 h-5" />, label: 'Audit Logs' },
    { id: 'profile', icon: <Settings className="w-5 h-5" />, label: 'Profile Settings' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <AdminDashboard user={user} onNavigate={setActiveTab} />;
      case 'users':
        return <UserManagement />;
      case 'verification':
        return <UserVerification />;
      case 'alerts':
        return <SystemAlerts />;
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
      case 'profile':
        return <ProfileSettings />;
      default:
        return <AdminDashboard user={user} onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out`}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <img 
              src={bloodlineLogo} 
              alt="BloodLine Logo" 
              className="w-auto h-8"
            />
          </div>
          <button onClick={() => setSidebarOpen(false)} className="cursor-pointer">
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>
        
        <nav className="p-4 space-y-1 flex-1 overflow-y-auto" style={{ height: 'calc(100vh - 180px)' }}>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors cursor-pointer ${
                activeTab === item.id
                  ? 'bg-red-50 text-red-600 font-medium' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white font-medium">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
              <p className="text-xs text-gray-500 truncate">{user.role}</p>
            </div>
          </div>
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ease-in-out ${sidebarOpen ? 'lg:ml-64' : 'ml-0'}`}>
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {!sidebarOpen && (
                <button 
                  onClick={() => setSidebarOpen(true)}
                  className="cursor-pointer"
                >
                  <Menu className="w-6 h-6 text-gray-700" />
                </button>
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {navItems.find(item => item.id === activeTab)?.label || 'Admin Dashboard'}
                </h1>
                <p className="text-sm text-gray-600">Welcome back, {user.name}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-gray-50">
          {renderContent()}
        </main>
      </div>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-white bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl max-w-sm w-full">
            <h2 className="text-xl font-bold text-gray-900 mb-3">Confirm Logout</h2>
            <p className="text-gray-600 mb-6">Are you sure you want to logout?</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  const { sessionAPI } = await import('../utils/apiClient');
                  await sessionAPI.logout();
                  onLogout();
                }}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLayout;