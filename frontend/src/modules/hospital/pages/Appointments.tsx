import { useEffect, useState } from 'react';
import { Calendar, User, Clock, CheckCircle, XCircle, Search, ArrowUpDown } from 'lucide-react';
import { hospitalAPI } from '../services/hospitalAPI';
import { useAuth } from '../../../context/AuthContext';

/**
 * Interface matching the patient_appointments table structure
 */
interface Appointment {
  appointmentId: number;     // appointment_id (PK)
  requestId: number;         // request_id (FK)
  patientId: number;         // patient_id (FK)
  hospitalId: number;        // hospital_id (FK)
  doctorId?: number;         // doctor_id (nullable)
  appointmentDate: string;   // appointment_date (datetime)
  status: 'Upcoming' | 'Completed' | 'Cancelled'; // status (enum)
  createdAt: string;         // created_at (datetime)
  doctorNotes?: string;      // doctor_notes (varchar 500, nullable)
  // Additional fields from joins
  patientName: string;       // from users table join
  doctorName: string;        // from doctors table join
  bloodType: string;         // from blood_requests table join
}

/**
 * Appointments Component - Manages patient appointments with card-based layout
 * 
 * Features:
 * - View appointments in card layout
 * - Filter by status (All, Upcoming, Completed, Cancelled)
 * - Complete appointments with doctor notes
 * - Cancel appointments with confirmation
 * - Delete appointments
 * 
 * Database: Connects to patient_appointments table in bloodline database
 */
export default function Appointments() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [completingId, setCompletingId] = useState<number | null>(null);
  const [doctorNotes, setDoctorNotes] = useState('');

  /**
   * Load appointments from database via API
   * Fetches from patient_appointments table with joins to get patient/doctor names
   */
  const loadAppointments = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      // API call to backend which queries patient_appointments table
      const response = await hospitalAPI.getAppointments(user.id);
      
      // Safe array handling - ensure we always set an array
      if (response && response.success && Array.isArray(response.data)) {
        setAppointments(response.data);
      } else if (Array.isArray(response)) {
        setAppointments(response);
      } else {
        console.warn('API returned non-array data:', response);
        setAppointments([]);
      }
    } catch (error) {
      console.error('Failed to load appointments from database:', error);
      setAppointments([]); // Ensure appointments is always an array
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, [user?.id]);

  /**
   * Complete appointment - Updates status from 'Upcoming' to 'Completed'
   * Updates patient_appointments table with doctor_notes
   */
  const completeAppointment = async (id: number) => {
    try {
      // API call to update patient_appointments table
      const result = await hospitalAPI.completeAppointment(id, { doctorNotes });
      
      if (result.success) {
        setCompletingId(null);
        setDoctorNotes('');
        alert('Appointment completed successfully! Patient has been notified.');
        loadAppointments(); // Refresh from database
      } else {
        alert('Failed to complete appointment');
      }
    } catch (error) {
      console.error('Failed to complete appointment in database:', error);
      alert('Failed to complete appointment');
    }
  };

  /**
   * Cancel appointment - Updates status to 'Cancelled'
   * Updates patient_appointments table status field
   */
  const cancelAppointment = async (id: number) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;
    
    try {
      // API call to update patient_appointments table status
      const result = await hospitalAPI.cancelAppointment(id);
      
      if (result.success) {
        alert('Appointment cancelled successfully! Patient has been notified.');
        loadAppointments(); // Refresh from database
      } else {
        alert('Failed to cancel appointment');
      }
    } catch (error) {
      console.error('Failed to cancel appointment in database:', error);
      alert('Failed to cancel appointment');
    }
  };

  // Safe filtering and sorting
  const filteredAppointments = Array.isArray(appointments) ? appointments
    .filter(apt => 
      (!statusFilter || apt.status.toLowerCase() === statusFilter.toLowerCase()) &&
      (!searchTerm || apt.patientName.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      const dateA = new Date(a.appointmentDate).getTime();
      const dateB = new Date(b.appointmentDate).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    }) : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="p-8">
        {/* Enhanced page header */}
        <div className="bg-gradient-to-r from-purple-500 to-blue-600 rounded-3xl p-8 text-white shadow-2xl mb-8">
          <h2 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
              <Calendar className="w-8 h-8" />
            </div>
            Appointment Management
          </h2>
          <p className="text-purple-100 text-lg">Manage patient appointments from bloodline database</p>
        </div>

        {/* Enhanced filters and search */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/50 mb-8">
          <div className="flex flex-wrap gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-6 py-4 border-2 border-purple-200 rounded-2xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300 bg-white/90 backdrop-blur-sm shadow-lg font-medium"
            >
              <option value="">All Appointments</option>
              <option value="upcoming">Upcoming</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            
            <div className="relative flex-1 min-w-[300px]">
              <Search className="w-5 h-5 absolute left-4 top-4 text-purple-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by patient name..."
                className="w-full pl-12 pr-4 py-4 border-2 border-purple-200 rounded-2xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300 bg-white/90 backdrop-blur-sm shadow-lg"
              />
            </div>
            
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="flex items-center gap-3 px-6 py-4 border-2 border-purple-200 rounded-2xl hover:bg-purple-50 hover:border-purple-300 transition-all duration-300 bg-white/90 backdrop-blur-sm shadow-lg font-medium hover:shadow-xl transform hover:scale-105"
            >
              <ArrowUpDown className="w-5 h-5 text-purple-500" />
              Date {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>

        {/* Enhanced appointments grid */}
        <div className="grid gap-8">
          {loading ? (
            <div className="text-center py-20">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mx-auto mb-6"></div>
                <div className="absolute inset-0 rounded-full bg-purple-100/20 animate-pulse"></div>
              </div>
              <p className="text-lg font-medium text-gray-500">Loading appointments from database...</p>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <div className="p-6 bg-purple-50 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                <Calendar className="w-12 h-12 text-purple-300" />
              </div>
              <p className="text-xl font-medium">No appointments found in database</p>
            </div>
          ) : (
            filteredAppointments.map((apt) => {
              const getCardColor = (status: string) => {
                switch (status.toLowerCase()) {
                  case 'completed': return 'bg-gradient-to-br from-green-100 to-emerald-100 border-green-300 shadow-green-200/50';
                  case 'cancelled': return 'bg-gradient-to-br from-red-100 to-pink-100 border-red-300 shadow-red-200/50';
                  case 'upcoming': return 'bg-gradient-to-br from-purple-100 to-indigo-100 border-purple-300 shadow-purple-200/50';
                  default: return 'bg-white/90 border-gray-200 shadow-gray-200/50';
                }
              };
              
              return (
                <div key={apt.appointmentId} className={`rounded-3xl shadow-2xl border-2 p-8 backdrop-blur-sm transition-all duration-300 hover:shadow-3xl transform hover:scale-[1.02] ${getCardColor(apt.status)}`}>
                  {/* Appointment Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <User className="w-6 h-6 text-blue-600" />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{apt.patientName}</h3>
                        <p className="text-gray-600">Blood Type: {apt.bloodType}</p>
                        <p className="text-xs text-gray-500">Request ID: {apt.requestId} | Patient ID: {apt.patientId}</p>
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

                  {/* Appointment Details */}
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

                  {/* Doctor Notes */}
                  {apt.doctorNotes && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700"><strong>Doctor Notes:</strong> {apt.doctorNotes}</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    {apt.status === 'Upcoming' && (
                      <>
                        <button
                          onClick={() => setCompletingId(apt.appointmentId)}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Complete
                        </button>
                        <button
                          onClick={() => cancelAppointment(apt.appointmentId)}
                          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <XCircle className="w-4 h-4" />
                          Cancel
                        </button>
                      </>
                    )}
                  </div>

                  {/* Database Info Footer */}
                  <div className="mt-4 pt-3 border-t border-gray-100 text-xs text-gray-500">
                    Created: {new Date(apt.createdAt).toLocaleString()} | ID: {apt.appointmentId}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Complete Appointment Modal */}
      {completingId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Complete Appointment</h3>
            <p className="text-gray-600 mb-4">
              This will update the appointment status to 'Completed' in the database.
            </p>
            <textarea
              value={doctorNotes}
              onChange={(e) => setDoctorNotes(e.target.value)}
              placeholder="Add final doctor notes (optional, max 500 characters)..."
              maxLength={500}
              className="w-full p-3 border border-gray-300 rounded-lg resize-none h-24 focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
            <div className="text-xs text-gray-500 mb-4">
              {doctorNotes.length}/500 characters
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => completingId && completeAppointment(completingId)}
                className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Complete Appointment
              </button>
              <button
                onClick={() => {
                  setCompletingId(null);
                  setDoctorNotes('');
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
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