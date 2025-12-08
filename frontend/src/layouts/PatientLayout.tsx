import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  HeartPulse,
  Calendar,
  Bell,
  User,
  LogOut,
  ListChecks,
  BarChart3,
} from "lucide-react";
import bloodlineLogo from "../assets/bloodline_logo.jpg";

export default function PatientLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // LEFT SIDEBAR LINKS
  const navItems = [
    { path: "/patient/dashboard", label: "Dashboard", Icon: LayoutDashboard },
    { path: "/patient/request-blood", label: "Request Blood", Icon: HeartPulse },
    { path: "/patient/view-requests", label: "My Requests", Icon: ListChecks },
    { path: "/patient/appointments", label: "Appointments", Icon: Calendar },
    { path: "/patient/notifications", label: "Notifications", Icon: Bell },
    { path: "/patient/insights", label: "Insights", Icon: BarChart3 },
    { path: "/patient/profile", label: "Profile", Icon: User },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">

      {/* ======================= TOP HEADER ======================= */}
      <header className="w-full bg-red-600 text-white px-6 py-4 flex items-center justify-between shadow">

        {/* Left: LOGO + SYSTEM NAME */}
        <div className="flex items-center gap-3">
          <img
            src={bloodlineLogo}
            alt="BloodLine Logo"
            className="w-10 h-10 rounded object-cover"
          />

          <div>
            <h1 className="text-lg font-semibold">BloodLine Patient Portal</h1>
          </div>
        </div>

        {/* Right: Notification + Profile Icons */}
        <div className="flex items-center gap-6">

          {/* Notification Icon */}
          <button
            onClick={() => navigate("/patient/notifications")}
            className="relative hover:opacity-80 transition"
          >
            <Bell className="w-6 h-6 text-white" />
            {/* Notification bubble (optional mock) */}
            <span className="absolute -top-2 -right-2 bg-white text-red-600 text-xs font-bold rounded-full px-2">
              3
            </span>
          </button>

          {/* Profile Icon */}
          <button
            onClick={() => navigate("/patient/profile")}
            className="hover:opacity-80 transition"
          >
            <User className="w-6 h-6 text-white" />
          </button>
        </div>
      </header>

      {/* ======================= MAIN CONTENT AREA ======================= */}
      <div className="flex flex-1">

        {/* ------- LEFT SIDEBAR ------- */}
        <aside className="w-80 bg-white shadow-lg min-h-full p-6 border-r">
          <ul className="space-y-3">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition ${
                    isActive
                      ? "bg-red-50 text-red-700 border-r-4 border-red-600"
                      : "text-gray-700 hover:bg-gray-100"
                  }`
                }
              >
                <item.Icon className="w-5 h-5" />
                {item.label}
              </NavLink>
            ))}
          </ul>

          {/* Logout Button */}
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="mt-10 w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </aside>

        {/* ------- RIGHT MAIN CONTENT ------- */}
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>

      {/* ======================= FOOTER ======================= */}
      <footer className="w-full bg-red-600 text-white text-center py-3 text-sm mt-4">
        © BloodLine {new Date().getFullYear()} — All Rights Reserved
      </footer>

      {/* ======================= LOGOUT CONFIRMATION MODAL ======================= */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50">
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
                onClick={handleLogout}
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
}
