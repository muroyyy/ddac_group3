import { useEffect, useState } from 'react';
import { Calendar, User, Clock, CheckCircle, XCircle } from 'lucide-react';
import { hospitalAPI } from '../services/hospitalAPI';
import { useAuth } from '../../../context/AuthContext';

interface Appointment {
  appointmentId: number;
  patientName: string;
  doctorName: string;
  appointmentDate: string;
  status: string;
  bloodType: string;
  doctorNotes?: string;
}

export default function Appointments() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [completingId, setCompletingId] = useState<number | null>(null);
  const [doctorNotes, setDoctorNotes] = useState('');

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const res = await hospitalAPI.getAppointments(user?.id || 1);
      setAppointments(res);
    } catch (error) {
      console.error('Failed to load appointments:', error);
      alert('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const completeAppointment = async (id: number) => {
    try {
      await hospitalAPI.completeAppointment(id, { doctorNotes });
      setCompletingId(null);
      setDoctorNotes('');
      alert('Appointment completed successfully! Patient has been notified.');
      loadAppointments();
    } catch (error) {
      console.error('Failed to complete appointment:', error);
      alert('Failed to complete appointment');
    }
  };

  const cancelAppointment = async (id: number) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      await hospitalAPI.cancelAppointment(id);
      alert('Appointment cancelled successfully! Patient has been notified.');
      loadAppointments();
    } catch (error) {
      console.error('Failed to cancel appointment:', error);
      alert('Failed to cancel appointment');
    }
  };

  const filteredAppointments = appointments.filter(apt => 
    !statusFilter || apt.status.toLowerCase() === statusFilter.toLowerCase()
  );

  return (
    <div className="p-6 bg-gradient-to-br from-blue-50 via-white to-blue-50 min-h-screen">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <Calendar className="w-8 h-8 text-blue-600" />
          Appointment Management
        </h2>
        <p className="text-gray-600">Manage patient appointments and update status</p>
      </div>

      {/* Status Filter */}
      <div className="mb-6">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Appointments</option>
          <option value="upcoming">Upcoming</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Appointments Grid */}
      <div className="grid gap-6">
        {loading ? (
          <div className="text-center py-8">Loading appointments...</div>
        ) : filteredAppointments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No appointments found</div>
        ) : (
          filteredAppointments.map((apt) => (
            <div key={apt.appointmentId} className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <User className="w-6 h-6 text-blue-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{apt.patientName}</h3>
                    <p className="text-gray-600">Blood Type: {apt.bloodType}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  apt.status === 'Upcoming' ? 'bg-yellow-100 text-yellow-700' :
                  apt.status === 'Completed' ? 'bg-green-100 text-green-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {apt.status}
                </span>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-700">Dr. {apt.doctorName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-700">{new Date(apt.appointmentDate).toLocaleString()}</span>
                </div>
              </div>

              {apt.doctorNotes && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700"><strong>Notes:</strong> {apt.doctorNotes}</p>
                </div>
              )}

              {apt.status === 'Upcoming' && (
                <div className="flex gap-3">
                  <button
                    onClick={() => setCompletingId(apt.appointmentId)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Complete
                  </button>
                  <button
                    onClick={() => cancelAppointment(apt.appointmentId)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    <XCircle className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Complete Appointment Modal */}
      {completingId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Complete Appointment</h3>
            <textarea
              value={doctorNotes}
              onChange={(e) => setDoctorNotes(e.target.value)}
              placeholder="Add final notes (optional)..."
              className="w-full p-3 border border-gray-300 rounded-lg resize-none h-24"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => completeAppointment(completingId)}
                className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
              >
                Complete
              </button>
              <button
                onClick={() => {
                  setCompletingId(null);
                  setDoctorNotes('');
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}