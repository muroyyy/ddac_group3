//Import neccessary tools for code functionality 


// React hooks for component state and lifecycle management
import { useEffect, useState } from "react";
// API service for patient-related backend calls
import { patientAPI } from '../../../api';
// Authentication context to get current logged-in user
import { useAuth } from "../../../context/AuthContext";
// TypeScript interface for type safety
import type { Appointment } from "../../../types/Appointment";


export default function Appointments() {
  // Get authenticated user details (contains user ID and session info)
  const { user } = useAuth();

  // STATE MANAGEMENT
  // Main data state - stores all appointments for this patient
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  // UI state for loading spinner
  const [loading, setLoading] = useState(true);
  // Error message state for displaying API errors
  const [error, setError] = useState("");

  // MODAL STATES - Control visibility of popup dialogs
  // Currently selected appointment for modal display
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  // Controls appointment details modal visibility
  const [showModal, setShowModal] = useState(false);
  // Controls cancellation confirmation dialog visibility
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);


  useEffect(() => {

    //Async function is used to load appointments from backend based on user ID
    const loadAppointments = async () => {
      try {
        // SECURITY CHECK - Ensure user is authenticated
        if (!user?.id) {
          setError("User session not found.");
          setLoading(false);
          return;
        }

        // API CALL - Get appointments for this patient
        // Backend will convert user ID to patient ID internally
        const result = await patientAPI.getAppointments(user.id);

        // RESPONSE HANDLING
        if (!result.success) {
          // Backend returned error response
          setError(result.message || "Failed to load appointments.");
        } else {
          // Success - update appointments state
          setAppointments(result.data || []);
        }
      } catch (err) {
        // NETWORK ERROR HANDLING - API call failed
        setError("Error loading appointments.");
        console.error("Appointment load error:", err);
      }

      // Always clear loading state (success or failure)
      setLoading(false);
    };

    // Execute the async function
    loadAppointments();
  }, [user]); // Dependency array - re-run when user changes

  //CSS styling for UI Components
  const getStatusClass = (status: string) => {
    switch (status) {
      case "Upcoming":
        return "text-blue-700 bg-blue-100";    // Blue for upcoming
      case "Completed":
        return "text-green-700 bg-green-100";  // Green for completed
      case "Cancelled":
        return "text-red-700 bg-red-100";      // Red for cancelled
      default:
        return "text-gray-700 bg-gray-100";    // Gray for unknown
    }
  };

//Split appointment into upcoming and past based on status
  const upcoming = appointments.filter((a) => a.status === "Upcoming");
  const past = appointments.filter((a) => a.status !== "Upcoming");

  /**

   Structure of the page is divided into sections:
   * 1. Page header
   * 2. Loading/error states
   * 3. Upcoming appointments section
   * 4. Past appointments section
   * 5. Modal dialogs
   */
  return (
    <div className="space-y-8 pb-10">
      {/* PAGE HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Appointments</h1>
        <p className="text-gray-600">View your upcoming and past medical appointments.</p>
      </div>

      {/* LOADING STATE - Show spinner while fetching data */}
      {loading && <p className="text-gray-500">Loading appointments...</p>}

      {/* ERROR STATE - Show error message if API call failed */}
      {!loading && error && (
        <p className="text-red-600 font-medium">{error}</p>
      )}

      {/* MAIN CONTENT - Show appointments if no loading/error */}
      {!loading && !error && (
        <>
          {/* UPCOMING APPOINTMENTS SECTION */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Upcoming Appointments</h2>

            {/* EMPTY STATE - No upcoming appointments */}
            {upcoming.length === 0 && (
              <p className="text-gray-500 italic">No upcoming appointments scheduled.</p>
            )}

            {/* APPOINTMENTS GRID - Responsive layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {upcoming.map((appt) => (
                <div
                  key={appt.appointmentId}
                  className="p-5 bg-white rounded-xl shadow hover:shadow-lg transition hover:-translate-y-1 border border-gray-200 cursor-pointer"
                >
                  {/* APPOINTMENT HEADER - ID and Status */}
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Appointment {appt.appointmentId}</h3>
                    <span className={`px-3 py-1 text-sm rounded-full font-medium ${getStatusClass(appt.status)}`}>
                      {appt.status}
                    </span>
                  </div>

                  {/* APPOINTMENT DETAILS */}
                  <div className="mt-4 text-sm space-y-2">
                    <p><strong>Doctor:</strong> {appt.doctorName}</p>
                    <p><strong>Hospital:</strong> {appt.hospitalName || 'Not specified'}</p>
                    <p><strong>Date:</strong> {appt.appointmentDate}</p>
                  </div>

                  {/* CANCEL BUTTON - Only for upcoming appointments */}
                  <div className="mt-4">
                    <button
                      onClick={() => {
                        // Set selected appointment and show modal
                        setSelectedAppt(appt);
                        setShowModal(true);
                      }}
                      className="w-full py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
                    >
                      Cancel Appointment
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* PAST APPOINTMENTS SECTION */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Past Appointments</h2>

            {/* EMPTY STATE - No past appointments */}
            {past.length === 0 && (
              <p className="text-gray-500 italic">No past appointments.</p>
            )}

            {/* PAST APPOINTMENTS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {past.map((appt) => (
                <div
                  key={appt.appointmentId}
                  className="p-5 bg-gray-50 rounded-xl border shadow-sm hover:shadow-md transition hover:-translate-y-1 cursor-pointer"
                >
                  {/* APPOINTMENT HEADER */}
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Appointment {appt.appointmentId}</h3>
                    <span className={`px-3 py-1 text-sm rounded-full font-medium ${getStatusClass(appt.status)}`}>
                      {appt.status}
                    </span>
                  </div>

                  {/* APPOINTMENT DETAILS - Including doctor notes for past appointments */}
                  <div className="mt-4 text-sm space-y-2">
                    <p><strong>Doctor:</strong> {appt.doctorName}</p>
                    <p><strong>Hospital:</strong> {appt.hospitalName || 'Not specified'}</p>
                    <p><strong>Date:</strong> {appt.appointmentDate}</p>
                    {/* DOCTOR NOTES - Only show if available */}
                    {appt.doctorNotes && (
                      <p><strong>Doctor Notes:</strong> {appt.doctorNotes}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {/* APPOINTMENT DETAILS MODAL */}
      {showModal && selectedAppt && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">
              Appointment {selectedAppt.appointmentId}
            </h2>

            {/* APPOINTMENT DETAILS IN MODAL */}
            <p><strong>Doctor:</strong> {selectedAppt.doctorName}</p>
            <p><strong>Hospital:</strong> {selectedAppt.hospitalName || 'Not specified'}</p>
            <p><strong>Date:</strong> {selectedAppt.appointmentDate}</p>
            <p><strong>Status:</strong> {selectedAppt.status}</p>

            {/* CANCEL BUTTON - Only for upcoming appointments */}
            {selectedAppt.status === "Upcoming" && (
              <button
                onClick={() => setShowConfirmCancel(true)}
                className="w-full mt-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
              >
                Cancel Appointment
              </button>
            )}

            {/* CLOSE MODAL BUTTON */}
            <button
              onClick={() => setShowModal(false)}
              className="w-full mt-2 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-800 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* CANCELLATION CONFIRMATION MODAL */}
      {showConfirmCancel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-xl font-semibold mb-4 text-gray-900">Cancel Appointment?</h3>
            <p className="text-gray-700 mb-6">
              Are you sure you want to cancel this appointment?
            </p>

            <div className="flex gap-3">
              {/* CONFIRM CANCELLATION BUTTON */}
              <button
                onClick={async () => {
                  /**
                   * APPOINTMENT CANCELLATION LOGIC
                   * 
                   * FLOW:
                   * 1. Validate appointment is selected
                   * 2. Call backend API to cancel appointment
                   * 3. Update local state to reflect change
                   * 4. Close modals and show feedback
                   */
                  try {
                    if (!selectedAppt) return;
                    
                    // API CALL - Cancel appointment in backend
                    const result = await patientAPI.cancelAppointment(selectedAppt.appointmentId);
                    
                    if (result.success) {
                      // SUCCESS - Update local state without refetching
                      setAppointments(prev => prev.map(a => 
                        a.appointmentId === selectedAppt.appointmentId 
                          ? { ...a, status: "Cancelled" as const } 
                          : a
                      ));
                      
                      // Close modals
                      setShowConfirmCancel(false);
                      setShowModal(false);
                    } else {
                      // Backend returned error
                      alert(result.message || "Failed to cancel appointment");
                    }
                  } catch (err) {
                    // Network error
                    console.error("Cancel error:", err);
                    alert("Error cancelling appointment");
                  }
                }}
                className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
              >
                Yes, Cancel
              </button>

              {/* CANCEL CANCELLATION BUTTON */}
              <button
                onClick={() => setShowConfirmCancel(false)}
                className="flex-1 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 font-medium"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}