import { useEffect, useState } from "react";
// Used to store appointment data and run code when the page loads

import { patientAPI } from '../../../api';
// Used to get appointment data from the backend

import { useAuth } from "../../../context/AuthContext";
// Used to know which patient is currently logged in

import type { Appointment } from "../../../types/Appointment";
// TypeScript type for appointment data structure

export default function Appointments() {

  // Get the logged-in patient details
  const { user } = useAuth();

  // These store the appointment data and page state
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // These control the popup modals
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);

  // This runs automatically when the page opens
  useEffect(() => {

    // Function to load appointments from backend
    const loadAppointments = async () => {
      try {
        // Stop if user is not logged in yet
        if (!user?.id) {
          setError("User session not found.");
          setLoading(false);
          return;
        }

        // Get appointments from backend
        const result = await patientAPI.getAppointments(user.id);

        if (!result.success) {
          // Show backend error message
          setError(result.message || "Failed to load appointments.");
        } else {
          // Save appointments into state
          setAppointments(result.data || []);
        }
      } catch (err) {
        // Show error if request fails
        setError("Error loading appointments.");
        console.error("Appointment load error:", err);
      }

      // Stop showing loading message
      setLoading(false);
    };

    // Call function when page loads
    loadAppointments();
  }, [user]); // Runs again if logged-in user changes

  // Function to get CSS colors based on appointment status
  const getStatusClass = (status: string) => {
    switch (status) {
      case "Upcoming":
        return "text-blue-700 bg-blue-100";   // Blue for upcoming
      case "Completed":
        return "text-green-700 bg-green-100"; // Green for completed
      case "Cancelled":
        return "text-red-700 bg-red-100";     // Red for cancelled
      default:
        return "text-gray-700 bg-gray-100";   // Gray for unknown
    }
  };

  // Split appointments into upcoming and past
  const upcoming = appointments.filter((a) => a.status === "Upcoming");
  const past = appointments.filter((a) => a.status !== "Upcoming");

  // Tailwind CSS for the page layout and styling
  return (
    <div className="space-y-8 pb-10">

      {/* Page title and description */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Appointments</h1>
        <p className="text-gray-600">View your upcoming and past medical appointments.</p>
      </div>

      {/* While data is loading, show loading text */}
      {loading && <p className="text-gray-500">Loading appointments...</p>}

      {/* Show error message if something goes wrong */}
      {!loading && error && (
        <p className="text-red-600 font-medium">{error}</p>
      )}

      {/* Show appointments if no loading or error */}
      {!loading && !error && (
        <>
          {/* UPCOMING APPOINTMENTS SECTION */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Upcoming Appointments</h2>

            {/* Show message if no upcoming appointments */}
            {upcoming.length === 0 && (
              <p className="text-gray-500 italic">No upcoming appointments scheduled.</p>
            )}

            {/* Grid layout for appointment cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {upcoming.map((appt) => (
                <div
                  key={appt.appointmentId}
                  className="p-5 bg-white rounded-xl shadow hover:shadow-lg transition hover:-translate-y-1 border border-gray-200 cursor-pointer"
                >
                  {/* Appointment header with ID and status */}
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Appointment {appt.appointmentId}</h3>
                    <span className={`px-3 py-1 text-sm rounded-full font-medium ${getStatusClass(appt.status)}`}>
                      {appt.status}
                    </span>
                  </div>

                  {/* Appointment details */}
                  <div className="mt-4 text-sm space-y-2">
                    <p><strong>Doctor:</strong> {appt.doctorName}</p>
                    <p><strong>Hospital:</strong> {appt.hospitalName || 'Not specified'}</p>
                    <p><strong>Date:</strong> {appt.appointmentDate}</p>
                  </div>

                  {/* Cancel button - only for upcoming appointments */}
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

            {/* Show message if no past appointments */}
            {past.length === 0 && (
              <p className="text-gray-500 italic">No past appointments.</p>
            )}

            {/* Grid layout for past appointment cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {past.map((appt) => (
                <div
                  key={appt.appointmentId}
                  className="p-5 bg-gray-50 rounded-xl border shadow-sm hover:shadow-md transition hover:-translate-y-1 cursor-pointer"
                >
                  {/* Appointment header */}
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Appointment {appt.appointmentId}</h3>
                    <span className={`px-3 py-1 text-sm rounded-full font-medium ${getStatusClass(appt.status)}`}>
                      {appt.status}
                    </span>
                  </div>

                  {/* Appointment details - includes doctor notes for past appointments */}
                  <div className="mt-4 text-sm space-y-2">
                    <p><strong>Doctor:</strong> {appt.doctorName}</p>
                    <p><strong>Hospital:</strong> {appt.hospitalName || 'Not specified'}</p>
                    <p><strong>Date:</strong> {appt.appointmentDate}</p>
                    {/* Show doctor notes only if available */}
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

      {/* APPOINTMENT DETAILS POPUP MODAL */}
      {showModal && selectedAppt && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">
              Appointment {selectedAppt.appointmentId}
            </h2>

            {/* Show appointment details in modal */}
            <p><strong>Doctor:</strong> {selectedAppt.doctorName}</p>
            <p><strong>Hospital:</strong> {selectedAppt.hospitalName || 'Not specified'}</p>
            <p><strong>Date:</strong> {selectedAppt.appointmentDate}</p>
            <p><strong>Status:</strong> {selectedAppt.status}</p>

            {/* Cancel button - only show for upcoming appointments */}
            {selectedAppt.status === "Upcoming" && (
              <button
                onClick={() => setShowConfirmCancel(true)}
                className="w-full mt-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
              >
                Cancel Appointment
              </button>
            )}

            {/* Close modal button */}
            <button
              onClick={() => setShowModal(false)}
              className="w-full mt-2 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-800 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* CANCELLATION CONFIRMATION POPUP MODAL */}
      {showConfirmCancel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-xl font-semibold mb-4 text-gray-900">Cancel Appointment?</h3>
            <p className="text-gray-700 mb-6">
              Are you sure you want to cancel this appointment?
            </p>

            <div className="flex gap-3">
              {/* Confirm cancellation button */}
              <button
                onClick={async () => {
                  // This runs when user clicks "Yes, Cancel"
                  try {
                    // Stop if no appointment is selected
                    if (!selectedAppt) return;
                    
                    // Send cancel request to backend
                    const result = await patientAPI.cancelAppointment(selectedAppt.appointmentId);
                    
                    if (result.success) {
                      // Update appointment status in the list without reloading
                      setAppointments(prev => prev.map(a => 
                        a.appointmentId === selectedAppt.appointmentId 
                          ? { ...a, status: "Cancelled" } 
                          : a
                      ));
                      // Close both modals
                      setShowConfirmCancel(false);
                      setShowModal(false);
                    } else {
                      // Show backend error message
                      alert(result.message || "Failed to cancel appointment");
                    }
                  } catch (err) {
                    // Show error if request fails
                    console.error("Cancel error:", err);
                    alert("Error cancelling appointment");
                  }
                }}
                className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
              >
                Yes, Cancel
              </button>

              {/* Keep appointment button */}
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
