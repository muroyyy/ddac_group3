// React hooks for state management and lifecycle
import { useEffect, useState } from 'react';
// Lucide React icons for UI elements
import { Search, Calendar, User, Stethoscope, Clock, CheckCircle, XCircle } from 'lucide-react';
// API service for hospital-related operations
import { hospitalAPI } from '../services/hospitalAPI';
// Authentication context to get current user information
import { useAuth } from '../../../context/AuthContext';

/**
 * TypeScript interface defining the structure of an appointment object
 * This ensures type safety throughout the component
 */
interface Appointment {
  appointmentId: number;    // Unique identifier for the appointment
  requestId: number;        // Reference to the original blood request
  patientName: string;      // Patient's full name
  patientPhone: string;     // Patient's contact number
  bloodType: string;        // Required blood type (A+, B-, O+, etc.)
  doctorName: string;       // Assigned doctor's name
  appointmentDate: string;  // Scheduled date and time
  status: string;           // Current status (Upcoming/Completed/Cancelled)
  doctorNotes: string;      // Medical notes from the doctor
  createdAt: string;        // When the appointment was created
}

/**
 * PatientAppointments Component
 * 
 * This component manages the display and interaction with patient appointments
 * for hospital staff. It provides functionality to:
 * - View all appointments for the hospital
 * - Search appointments by patient name
 * - Filter appointments by status
 * - Complete appointments with doctor notes
 * - Cancel appointments
 * 
 * Security: Only shows appointments for the logged-in hospital staff's hospital
 */
export default function PatientAppointments() {
  // Get current authenticated user from context
  const { user } = useAuth();
  
  // State management for component data and UI
  const [appointments, setAppointments] = useState<Appointment[]>([]);           // List of appointments
  const [loading, setLoading] = useState(true);                                 // Loading state for API calls
  const [searchTerm, setSearchTerm] = useState('');                            // Search input value
  const [statusFilter, setStatusFilter] = useState('All');                     // Status filter selection
  const [showCompleteModal, setShowCompleteModal] = useState(false);           // Modal visibility state
  const [completingAppointment, setCompletingAppointment] = useState<Appointment | null>(null); // Appointment being completed
  const [doctorNotes, setDoctorNotes] = useState('');                         // Doctor notes input

  /**
   * Loads appointments from the backend API
   * 
   * This function:
   * 1. Validates user authentication
   * 2. Sets loading state to show spinner
   * 3. Calls the hospital API with user ID for security
   * 4. Updates the appointments state with received data
   * 5. Handles errors gracefully
   * 6. Always clears loading state when done
   */
  const loadAppointments = async () => {
    // Security check: ensure user is authenticated
    if (!user?.id) return;
    
    setLoading(true);
    try {
      // API call to get appointments for this hospital staff member
      const response = await hospitalAPI.getAppointments(user.id);
      if (response.success) {
        // Update state with appointments data (fallback to empty array)
        setAppointments(response.data || []);
      }
    } catch (error) {
      // Log error for debugging but don't crash the UI
      console.error('Failed to load appointments:', error);
    } finally {
      // Always clear loading state, whether success or failure
      setLoading(false);
    }
  };

  /**
   * React useEffect hook to load appointments when component mounts
   * Empty dependency array means this runs only once after initial render
   */
  useEffect(() => {
    loadAppointments();
  }, []);

  /**
   * Opens the completion modal for a specific appointment
   * 
   * @param appointment - The appointment to be completed
   */
  const showCompleteDialog = (appointment: Appointment) => {
    setCompletingAppointment(appointment);              // Store which appointment is being completed
    setDoctorNotes(appointment.doctorNotes || '');      // Pre-fill existing notes if any
    setShowCompleteModal(true);                         // Show the modal
  };

  /**
   * Completes an appointment with doctor notes
   * 
   * This function:
   * 1. Validates that an appointment is selected
   * 2. Calls the API to mark appointment as completed
   * 3. Sends doctor notes to be stored in database
   * 4. Refreshes the appointments list
   * 5. Closes the modal and resets state
   * 6. Shows user feedback
   */
  const completeAppointment = async () => {
    // Safety check: ensure an appointment is selected
    if (!completingAppointment) return;
    
    try {
      // API call to complete the appointment with doctor notes
      const result = await hospitalAPI.completeAppointment(completingAppointment.appointmentId, {
        doctorNotes: doctorNotes
      });
      
      if (result.success) {
        // Success: Clean up modal state and refresh data
        setShowCompleteModal(false);
        setCompletingAppointment(null);
        setDoctorNotes('');
        loadAppointments();  // Refresh the appointments list
        alert('Appointment completed successfully!');
      } else {
        alert('Failed to complete appointment');
      }
    } catch (error) {
      // Handle network or server errors
      console.error('Failed to complete appointment:', error);
      alert('Failed to complete appointment');
    }
  };

  /**
   * Cancels an appointment after user confirmation
   * 
   * @param id - The appointment ID to cancel
   */
  const cancelAppointment = async (id: number) => {
    // User confirmation to prevent accidental cancellations
    if (!confirm('Are you sure you want to cancel this appointment?')) return;
    
    try {
      // API call to cancel the appointment
      const result = await hospitalAPI.cancelAppointment(id);
      if (result.success) {
        loadAppointments();  // Refresh the list to show updated status
        alert('Appointment cancelled successfully!');
      } else {
        alert('Failed to cancel appointment');
      }
    } catch (error) {
      console.error('Failed to cancel appointment:', error);
      alert('Failed to cancel appointment');
    }
  };

  /**
   * Filters appointments based on search term and status filter
   * 
   * This creates a derived state that updates automatically when:
   * - appointments data changes
   * - searchTerm changes
   * - statusFilter changes
   */
  const filteredAppointments = appointments.filter(appointment => {
    // Case-insensitive search by patient name
    const matchesSearch = appointment.patientName.toLowerCase().includes(searchTerm.toLowerCase());
    // Status filter ("All" shows everything, otherwise exact match)
    const matchesStatus = statusFilter === 'All' || appointment.status === statusFilter;
    // Both conditions must be true
    return matchesSearch && matchesStatus;
  });

  /**
   * Returns appropriate CSS classes for status badges
   * 
   * @param status - The appointment status
   * @returns CSS classes for styling the status badge
   */
  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case 'upcoming': return 'bg-blue-100 text-blue-700 border-blue-200';    // Blue for upcoming
      case 'completed': return 'bg-green-100 text-green-700 border-green-200'; // Green for completed
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';      // Red for cancelled
      default: return 'bg-gray-100 text-gray-700 border-gray-200';            // Gray for unknown status
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Calendar className="w-6 h-6 text-red-600" />
          Patient Appointments
        </h1>
        <p className="text-gray-600">
          Manage and track patient appointments for your hospital
        </p>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex gap-4 mb-6">
        {/* Search Input with Icon */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            id="search-appointments"
            type="text"
            placeholder="Search by patient name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}  // Real-time search as user types
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500"
          />
        </div>
        
        {/* Status Filter Dropdown */}
        <select
          id="status-filter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}  // Update filter when selection changes
          className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500"
        >
          <option value="All">All Status</option>
          <option value="Upcoming">Upcoming</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      {/* Main Appointments Table Container */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {/* Loading State */}
        {loading ? (
          <div className="text-center py-16 text-gray-500">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600 mx-auto mb-4"></div>
            Loading appointments...
          </div>
        ) : /* Empty State */ filteredAppointments.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            No appointments found
          </div>
        ) : /* Data Table */ (
          <div className="overflow-x-auto">
            <table className="w-full">
              {/* Table Header */}
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
              
              {/* Table Body - Dynamic Rows */}
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredAppointments.map((appointment, index) => (
                  <tr 
                    key={appointment.appointmentId} 
                    className={`${index % 2 === 0 ? 'bg-white' : 'bg-red-25'} hover:bg-red-50 transition-colors duration-200`}
                  >
                    {/* Patient Information Column */}
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
                    
                    {/* Blood Type Column */}
                    <td className="px-8 py-6 whitespace-nowrap">
                      <span className="text-lg font-bold text-red-600 bg-red-50 px-3 py-1 rounded-full">
                        {appointment.bloodType}
                      </span>
                    </td>
                    
                    {/* Doctor Column */}
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="flex items-center">
                        <Stethoscope className="w-4 h-4 text-blue-500 mr-2" />
                        <span className="text-sm font-medium text-gray-900">{appointment.doctorName}</span>
                      </div>
                    </td>
                    
                    {/* Date & Time Column */}
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-700">
                          {new Date(appointment.appointmentDate).toLocaleString()}
                        </span>
                      </div>
                    </td>
                    
                    {/* Status Column */}
                    <td className="px-8 py-6 whitespace-nowrap">
                      <span className={`px-3 py-2 rounded-full text-xs font-semibold border-2 ${getStatusStyle(appointment.status)}`}>
                        {appointment.status}
                      </span>
                    </td>
                    
                    {/* Action Buttons Column */}
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="flex space-x-2">
                        {/* Only show action buttons for upcoming appointments */}
                        {appointment.status === 'Upcoming' && (
                          <>
                            {/* Complete Appointment Button */}
                            <button
                              onClick={() => showCompleteDialog(appointment)}
                              className="text-green-700 hover:text-green-900 px-4 py-2 rounded-lg bg-green-50 hover:bg-green-100 border border-green-200 font-medium transition-all duration-200 hover:shadow-md flex items-center gap-1"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Complete
                            </button>
                            
                            {/* Cancel Appointment Button */}
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
      {/* Only render modal when both conditions are true */}
      {showCompleteModal && completingAppointment && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md transform transition-all">
            {/* Modal Header */}
            <h3 className="text-xl font-bold text-gray-900 mb-2">Complete Appointment</h3>
            <p className="text-gray-600 mb-6">
              Patient: <strong>{completingAppointment.patientName}</strong>
            </p>
            
            {/* Doctor Notes Input */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Doctor Notes</label>
                <textarea
                  id="doctor-notes"
                  placeholder="Add notes about the appointment..."
                  value={doctorNotes}
                  onChange={(e) => setDoctorNotes(e.target.value)}  // Update notes as user types
                  className="w-full p-4 border border-gray-300 rounded-xl h-32 resize-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>

            {/* Modal Action Buttons */}
            <div className="flex gap-3 mt-8">
              {/* Confirm Complete Button */}
              <button
                onClick={completeAppointment}
                className="flex-1 bg-green-600 text-white py-3 px-4 rounded-xl hover:bg-green-700 transition-colors font-medium"
              >
                Complete Appointment
              </button>
              
              {/* Cancel Modal Button */}
              <button
                onClick={() => {
                  // Reset all modal-related state
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