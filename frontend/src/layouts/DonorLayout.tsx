import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function DonorLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/donor/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/donor/donate', label: 'Donate Blood', icon: '🩸' },
    { path: '/donor/history', label: 'History', icon: '📋' },
    { path: '/donor/profile', label: 'Profile', icon: '👤' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-red-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-xl font-bold">🩸 BloodLine - Donor</span>
            </div>
            <div className="flex items-center space-x-4">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-md text-sm font-medium transition ${
                      isActive
                        ? 'bg-red-700 text-white'
                        : 'text-red-100 hover:bg-red-500'
                    }`
                  }
                >
                  {item.icon} {item.label}
                </NavLink>
              ))}
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-700 rounded-md text-sm font-medium hover:bg-red-800 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
