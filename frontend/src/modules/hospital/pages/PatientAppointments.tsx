import { useEffect, useState } from 'react';
import { Calendar } from 'lucide-react';
import { hospitalAPI } from '../services/hospitalAPI';
import { useAuth } from '../../../context/AuthContext';

export default function PatientAppointments() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAppointments = async () => {
      if (!user?.id) return;
      try {
        const response = await hospitalAPI.getAppointments(user.id);
        setAppointments(Array.isArray(response?.data) ? response.data : []);
      } catch (error) {
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    };
    loadAppointments();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600 mx-auto mb-4"></div>
        Loading appointments...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Calendar className="w-6 h-6 text-red-600" />
          Patient Appointments
        </h1>
        <p className="text-gray-600">Manage patient appointments</p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6">
        {appointments.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            No appointments found
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((appointment, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">{appointment.patientName || 'Unknown Patient'}</h3>
                    <p className="text-sm text-gray-600">{appointment.appointmentDate}</p>
                    <p className="text-sm text-gray-600">Status: {appointment.status}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}