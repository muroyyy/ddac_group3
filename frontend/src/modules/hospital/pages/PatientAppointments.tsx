import { useEffect, useState } from 'react';
import { Search, Calendar, User, Clock } from 'lucide-react';
import { hospitalAPI } from '../services/hospitalAPI';
import { useAuth } from '../../../context/AuthContext';

interface Appointment {
  appointmentId: number;
  patientName: string;
  doctorName: string;
  appointmentDate: string;
  status: string;
  bloodType: string;
  doctorNotes: string;
}

export default function PatientAppointments() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [completingAppointment, setCompletingAppointment] = useState<Appointment | null>(null);
  const [doctorNotes, setDoctorNotes] = useState('');

  const loadAppointments = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const response = await hospitalAPI.getAppointments(user.id);
      // Ensure we always set an array, even if API returns unexpected data
      if (response && response.success && Array.isArray(response.data)) {
        setAppointments(response.data);
      } else {
        console.warn('API returned non-array data:', response);
        setAppointments([]);
      }
    } catch (error) {
      console.error('Failed to load appointments:', error);
      setAppointments([]); // Ensure appointments is always an array
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, [user?.id]);

  const showCompleteDialog = (appointment: Appointment) => {
    setCompletingAppointment(appointment);
    setDoctorNotes(appointment.doctorNotes || '');
    setShowCompleteModal(true);
  };

  const completeAppointment = async () => {
    if (!completingAppointment) return;
    
    try {
      const result = await hospitalAPI.completeAppointment(completingAppointment.appointmentId, {
        doctorNotes: doctorNotes
      });
      
      if (result.success) {
        setShowCompleteModal(false);
        setCompletingAppointment(null);
        setDoctorNotes('');
        loadAppointments();
        alert('Appointment completed successfully!');
      } else {
        alert('Failed to complete appointment');
      }
    } catch (error) {
      console.error('Failed to complete appointment:', error);
      alert('Failed to complete appointment');
    }
  };

  const cancelAppointment = async (id: number) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;
    
    try {
      const result = await hospitalAPI.cancelAppointment(id);
      if (result.success) {
        loadAppointments();
        alert('Appointment cancelled successfully!');
      } else {
        alert('Failed to cancel appointment');
      }
    } catch (error) {
      console.error('Failed to cancel appointment:', error);
      alert('Failed to cancel appointment');
    }
  };

  // Safe filtering - ensure appointments is always an array
  const filteredAppointments = Array.isArray(appointments) ? appointments.filter(appointment => {
    const matchesSearch = appointment.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    const matchesStatus = statusFilter === 'All' || appointment.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) : [];

  const getStatusStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'upcoming': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'completed': return 'bg-green-100 text-green-700 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Calendar className="w-6 h-6 text-red-600" />
          Patient Appointments
        </h1>
        <p className="text-gray-600">
          Manage and track patient appointments for your hospital
        </p>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by patient name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500"
          />
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500"
        >
          <option value="All">All Status</option>
          <option value="Upcoming">Upcoming</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="text-center py-12 text-gray-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
            Loading appointments...
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            No appointments found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-red-50 border-b border-red-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-red-700 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-red-700 uppercase tracking-wider">
                    Doctor
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-red-700 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-red-700 uppercase tracking-wider">
                    Blood Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-red-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-red-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAppointments.map((appointment, index) => (
                  <tr 
                    key={appointment.appointmentId} 
                    className={index % 2 === 0 ? 'bg-white' : 'bg-red-50/30 hover:bg-red-50/50'}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                          <User className="w-4 h-4 text-red-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-900">{appointment.patientName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{appointment.doctorName}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{appointment.appointmentDate}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-red-600">{appointment.bloodType}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusStyle(appointment.status)}`}>
                        {appointment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {appointment.status === 'Upcoming' && (
                          <>
                            <button
                              onClick={() => showCompleteDialog(appointment)}
                              className="text-green-600 hover:text-green-900 px-2 py-1 rounded bg-green-50 hover:bg-green-100"
                            >
                              Complete
                            </button>
                            <button
                              onClick={() => cancelAppointment(appointment.appointmentId)}
                              className="text-red-600 hover:text-red-900 px-2 py-1 rounded bg-red-50 hover:bg-red-100"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Complete Appointment Modal */}
      {showCompleteModal && completingAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Complete Appointment</h3>
            <p className="text-gray-600 mb-4">
              Patient: <strong>{completingAppointment.patientName}</strong>
            </p>
            
            <textarea
              placeholder="Doctor notes (optional)..."
              value={doctorNotes}
              onChange={(e) => setDoctorNotes(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg h-24 resize-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />

            <div className="flex gap-3 mt-6">
              <button
                onClick={completeAppointment}
                className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Complete Appointment
              </button>
              <button
                onClick={() => {
                  setShowCompleteModal(false);
                  setCompletingAppointment(null);
                  setDoctorNotes('');
                }}
                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors"
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