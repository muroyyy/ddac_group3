import { useEffect, useState } from 'react';
import { Calendar } from 'lucide-react';
import { hospitalAPI } from '../services/hospitalAPI';
import { useAuth } from '../../../context/AuthContext';

export default function PatientAppointments() {
  const { user } = useAuth();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!user?.id) return;
      try {
        const res = await hospitalAPI.getAppointments(user.id);
        setData(res?.data || []);
      } catch (e) {
        setData([]);
      }
      setLoading(false);
    }
    load();
  }, [user?.id]);

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <Calendar className="w-6 h-6" />
        Patient Appointments
      </h1>
      
      <div className="bg-white rounded-lg shadow p-6">
        {data.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No appointments found</p>
        ) : (
          <div className="space-y-4">
            {data.map((item, i) => (
              <div key={i} className="border rounded p-4">
                <p><strong>Patient:</strong> {item?.patientName || 'Unknown'}</p>
                <p><strong>Date:</strong> {item?.appointmentDate || 'N/A'}</p>
                <p><strong>Status:</strong> {item?.status || 'Unknown'}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}