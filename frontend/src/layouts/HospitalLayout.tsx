import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Box, Clipboard, User, LogOut } from 'lucide-react';

export default function HospitalLayout() {
	const { logout, user } = useAuth();
	const navigate = useNavigate();
	const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

	const handleLogout = async () => {
		const { sessionAPI } = await import('../utils/apiClient');
		await sessionAPI.logout();
		logout();
		navigate('/login');
	};

	const navItems = [
		{ path: '/hospital/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
		{ path: '/hospital/inventory', label: 'Manage Inventory', Icon: Clipboard },
		{ path: '/hospital/approvals', label: 'Approvals', Icon: Box },
		{ path: '/hospital/profile', label: 'Profile', Icon: User },
	];

	return (
		<div className="min-h-screen flex bg-gray-50">
			<aside className="w-64 bg-white border-r">
				<div className="h-16 flex items-center px-6 border-b">
					<span className="text-lg font-semibold">🩸 BloodLine</span>
				</div>
				<nav className="p-4">
					<div className="space-y-1">
						{navItems.map((item) => (
							<NavLink
								key={item.path}
								to={item.path}
								className={({ isActive }) =>
									`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition ${
										isActive ? 'bg-red-600 text-white' : 'text-gray-700 hover:bg-gray-100'
									}`
								}
							>
								<item.Icon className="w-5 h-5" />
								{item.label}
							</NavLink>
						))}
					</div>
				</nav>

				<div className="absolute bottom-6 w-64 px-4">
					<div className="border-t pt-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-gray-800">{user?.name}</p>
								<p className="text-xs text-gray-500 truncate">{user?.email}</p>
							</div>
							<button onClick={() => setShowLogoutConfirm(true)} className="text-red-600 hover:text-red-800 cursor-pointer">
								<LogOut className="w-5 h-5" />
							</button>
						</div>
					</div>
				</div>
			</aside>

			<main className="flex-1 p-8">
				<Outlet />
			</main>

			{/* Logout Confirmation Modal */}
			{showLogoutConfirm && (
				<div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
					<div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full transform transition-all">
						{/* Icon */}
						<div className="flex justify-center pt-8 pb-4">
							<div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
								<LogOut className="w-8 h-8 text-red-600" />
							</div>
						</div>
						
						{/* Content */}
						<div className="px-8 pb-6 text-center">
							<h2 className="text-2xl font-bold text-gray-900 mb-2">Logout</h2>
							<p className="text-gray-600 text-sm">Are you sure you want to logout from your account?</p>
						</div>
						
						{/* Buttons */}
						<div className="flex border-t border-gray-200">
							<button
								onClick={() => setShowLogoutConfirm(false)}
								className="flex-1 py-4 text-gray-700 font-semibold hover:bg-gray-50 transition rounded-bl-3xl"
							>
								Cancel
							</button>
							<div className="w-px bg-gray-200"></div>
							<button
								onClick={handleLogout}
								className="flex-1 py-4 text-red-600 font-semibold hover:bg-red-50 transition rounded-br-3xl"
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

