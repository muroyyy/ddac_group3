import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { patientAPI } from '../services/patientAPI';
import type { NotificationItem } from '../services/patientAPI';

export default function Notifications() {
  const { user } = useAuth();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) load();
  }, [user]);

  const load = async () => {
    setLoading(true);
    try {
      const data = await patientAPI.getNotifications(user!.id);
      setItems(data);
    } catch (err) {
      console.error('Error loading notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-6">Loading notifications...</div>;

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Notifications</h1>
      <div className="space-y-4">
        {items.map((n) => (
          <div key={n.id} className={`p-4 rounded-lg border ${n.read ? 'bg-gray-50' : 'bg-white'}`}>
            <div className="flex justify-between">
              <div>
                <div className="font-semibold">{n.title}</div>
                <div className="text-sm text-gray-600">{n.body}</div>
              </div>
              <div className="text-xs text-gray-400">{n.date}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
