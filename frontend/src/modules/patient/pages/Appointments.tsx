import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { patientAPI } from '../services/patientAPI';
import type { Appointment } from '../services/patientAPI';

export default function Appointments() {
  const { user } = useAuth();
  const [items, setItems] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) load();
  }, [user]);

  const load = async () => {
    setLoading(true);
    try {
      const data = await patientAPI.getPatientAppointments(user!.id);
      setItems(data);
    } catch (err) {
      console.error('Error loading appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-6">Loading appointments...</div>;

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Appointments</h1>
      <div className="space-y-4">
        {items.map((a) => (
          <div key={a.id} className="bg-white p-4 rounded-lg shadow flex justify-between">
            <div>
              <div className="font-semibold">{a.hospitalName}</div>
              <div className="text-sm text-gray-600">{a.date} • {a.time}</div>
            </div>
            <div className="text-sm text-gray-500">{a.status}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
