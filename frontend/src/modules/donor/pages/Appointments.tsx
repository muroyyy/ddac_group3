import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { donorAPI } from '../services/donorAPI';
import { useAuth } from '../../../hooks/useAuth';

interface Appointment {
  id: number;
  hospitalName: string;
  date: string;
  time: string;
  status: string;
  bloodType: string;
  units: number;
  doctorNotes?: string;
}

export default function Appointments() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      if (user?.id) {
        const response = await donorAPI.getAppointments(user.id);
        if (response.success) {
          setAppointments(response.data);
        } else {
          console.error('API returned unsuccessful response:', response);
          setAppointments([]);
        }
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      // Check if error is due to HTML response
      if (error instanceof Error && error.message.includes('text/html')) {
        console.error('❌ Received HTML instead of JSON - API endpoint may not be deployed');
      }
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate('/donor/dashboard')}
          className="text-red-600 hover:text-red-700 mb-4"
        >
          ← Back to Dashboard
        </button>
        <h1 className="text-2xl font-bold text-gray-900">My Appointments</h1>
        <p className="text-gray-600 mt-2">View and manage your donation appointments</p>
      </div>

      {appointments.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500 mb-4">You don't have any appointments scheduled.</p>
          <button
            onClick={() => navigate('/donor/donate')}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition"
          >
            Request to Donate
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <div
                key={appointment.id}
                onClick={() => setSelectedAppointment(appointment)}
                className={`bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-md transition ${
                  selectedAppointment?.id === appointment.id ? 'ring-2 ring-red-500' : ''
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-900">{appointment.hospitalName}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                    {appointment.status}
                  </span>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>Date: <span className="font-medium">{new Date(appointment.date).toLocaleDateString()}</span></p>
                  <p>Time: <span className="font-medium">{appointment.time}</span></p>
                  <p>Blood Type: <span className="font-medium">{appointment.bloodType}</span></p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            {selectedAppointment ? (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Appointment Details</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Hospital</label>
                    <p className="text-gray-900">{selectedAppointment.hospitalName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedAppointment.status)}`}>
                      {selectedAppointment.status}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date</label>
                    <p className="text-gray-900">{new Date(selectedAppointment.date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Time</label>
                    <p className="text-gray-900">{selectedAppointment.time}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Blood Type</label>
                    <p className="text-gray-900">{selectedAppointment.bloodType}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Units</label>
                    <p className="text-gray-900">{selectedAppointment.units}</p>
                  </div>
                  {selectedAppointment.doctorNotes && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Notes</label>
                      <p className="text-gray-900">{selectedAppointment.doctorNotes}</p>
                    </div>
                  )}
                </div>
                
                {selectedAppointment.status === 'Scheduled' && (
                  <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-700">
                      <strong>Reminder:</strong> Please bring a valid ID and ensure you've had a good meal before your appointment.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-gray-500">
                <p>Select an appointment to view details</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}