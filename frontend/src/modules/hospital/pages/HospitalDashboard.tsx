import { useState, useEffect } from 'react';
import { Droplet, Users, AlertTriangle, Activity } from 'lucide-react';
import { hospitalAPI } from '../services/hospitalAPI';
import type { DashboardStats } from '../services/hospitalAPI';

interface HospitalDashboardProps {
  user: { id: number; name: string; email: string; role: string };
  onNavigate: (tab: string) => void;
}

export default function HospitalDashboard({ user, onNavigate }: HospitalDashboardProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    hospitalAPI.getDashboardStats(user.id).then(data => {
      setStats(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [user.id]);

  const cards = [
    { title: 'Total Blood Units', value: stats?.totalInventory || 0, icon: <Droplet className="w-6 h-6 text-red-600" /> },
    { title: 'Pending Approvals', value: stats?.pendingApprovals || 0, icon: <Users className="w-6 h-6 text-blue-600" /> },
    { title: 'Low Stock Alerts', value: stats?.lowStockCount || 0, icon: <AlertTriangle className="w-6 h-6 text-yellow-600" /> },
    { title: 'System Status', value: stats?.systemHealth || 'Loading', icon: <Activity className="w-6 h-6 text-green-600" /> },
  ];

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Hospital Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {cards.map((card, i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow border">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-600 text-sm">{card.title}</p>
                <p className="text-3xl font-bold mt-2">{loading ? '...' : card.value}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">{card.icon}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button onClick={() => onNavigate('inventory')} className="p-6 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold">
          Manage Blood Inventory
        </button>
        <button onClick={() => onNavigate('approvals')} className="p-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold">
          Review Approvals
        </button>
      </div>
    </div>
  );
}
