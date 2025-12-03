import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { patientAPI } from '../services/patientAPI';
import type { BloodRequest } from '../services/patientAPI';

export default function ViewRequests() {
  const { user } = useAuth();
  const [items, setItems] = useState<BloodRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) load();
  }, [user]);

  const load = async () => {
    setLoading(true);
    try {
      const data = await patientAPI.getBloodRequests(user!.id);
      setItems(data);
    } catch (err) {
      console.error('Error loading requests:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-6">Loading requests...</div>;

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Your Blood Requests</h1>
      <div className="space-y-4">
        {items.map((r) => (
          <div key={r.id} className="bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between">
              <div>
                <div className="font-semibold">{r.bloodType} • {r.unitsRequested} units</div>
                <div className="text-sm text-gray-600">{r.notes}</div>
              </div>
              <div className="text-sm text-gray-500">{r.status}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
