import { useEffect, useState } from 'react';
import { Search, Calendar, User, Stethoscope, Clock, CheckCircle, XCircle } from 'lucide-react';
import { hospitalAPI } from '../services/hospitalAPI';
import { useAuth } from '../../../context/AuthContext';

interface Appointment {
  appointmentId: number;
  requestId: number;
  patientName: string;
  patientPhone: string;
  bloodType: string;
  doctorName: string;
  appointmentDate: string;
  status: string;
  doctorNotes: string;
  createdAt: string;
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
      if (response.success) {
        setAppointments(response.data || []);
      }
    } catch (error) {
      console.error('Failed to load appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

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

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = appointment.patientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || appointment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
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
            id="search-appointments"
            type="text"
            placeholder="Search by patient name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500"
          />
        </div>
        <select
          id="status-filter"
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

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="text-center py-16 text-gray-500">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600 mx-auto mb-4"></div>
            Loading appointments...
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            No appointments found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-red-50 to-red-100 border-b border-red-200">
                <tr>
                  <th className="px-8 py-5 text-left text-sm font-semibold text-red-800 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-8 py-5 text-left text-sm font-semibold text-red-800 uppercase tracking-wider">
                    Blood Type
                  </th>
                  <th className="px-8 py-5 text-left text-sm font-semibold text-red-800 uppercase tracking-wider">
                    Doctor
                  </th>
                  <th className="px-8 py-5 text-left text-sm font-semibold text-red-800 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-8 py-5 text-left text-sm font-semibold text-red-800 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-8 py-5 text-left text-sm font-semibold text-red-800 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredAppointments.map((appointment, index) => (
                  <tr 
                    key={appointment.appointmentId} 
                    className={`${index % 2 === 0 ? 'bg-white' : 'bg-red-25'} hover:bg-red-50 transition-colors duration-200`}
                  >
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mr-4">
                          <User className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{appointment.patientName}</div>
                          <div className="text-xs text-gray-500">{appointment.patientPhone}</div>
                          <div className="text-xs text-gray-400">Request #{appointment.requestId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <span className="text-lg font-bold text-red-600 bg-red-50 px-3 py-1 rounded-full">
                        {appointment.bloodType}
                      </span>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="flex items-center">
                        <Stethoscope className="w-4 h-4 text-blue-500 mr-2" />
                        <span className="text-sm font-medium text-gray-900">{appointment.doctorName}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-700">
                          {new Date(appointment.appointmentDate).toLocaleString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <span className={`px-3 py-2 rounded-full text-xs font-semibold border-2 ${getStatusStyle(appointment.status)}`}>
                        {appointment.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="flex space-x-2">
                        {appointment.status === 'Upcoming' && (
                          <>
                            <button
                              onClick={() => showCompleteDialog(appointment)}
                              className="text-green-700 hover:text-green-900 px-4 py-2 rounded-lg bg-green-50 hover:bg-green-100 border border-green-200 font-medium transition-all duration-200 hover:shadow-md flex items-center gap-1"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Complete
                            </button>
                            <button
                              onClick={() => cancelAppointment(appointment.appointmentId)}
                              className="text-red-700 hover:text-red-900 px-4 py-2 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200 font-medium transition-all duration-200 hover:shadow-md flex items-center gap-1"
                            >
                              <XCircle className="w-4 h-4" />
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
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md transform transition-all">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Complete Appointment</h3>
            <p className="text-gray-600 mb-6">
              Patient: <strong>{completingAppointment.patientName}</strong>
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Doctor Notes</label>
                <textarea
                  id="doctor-notes"
                  placeholder="Add notes about the appointment..."
                  value={doctorNotes}
                  onChange={(e) => setDoctorNotes(e.target.value)}
                  className="w-full p-4 border border-gray-300 rounded-xl h-32 resize-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={completeAppointment}
                className="flex-1 bg-green-600 text-white py-3 px-4 rounded-xl hover:bg-green-700 transition-colors font-medium"
              >
                Complete Appointment
              </button>
              <button
                onClick={() => {
                  setShowCompleteModal(false);
                  setCompletingAppointment(null);
                  setDoctorNotes('');
                }}
                className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-xl hover:bg-gray-200 transition-colors font-medium"
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
