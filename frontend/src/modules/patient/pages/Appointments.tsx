import { useEffect, useState } from "react";
import { patientAPI } from "../../../utils/apiClient";
import { useAuth } from "../../../context/AuthContext";
import type { Appointment } from "../../../types/Appointment";

export default function Appointments() {
  const { user } = useAuth();

  // Store all appointments from backend
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  // UI state handling
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal states
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Cancel confirmation modal
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);

  // --------------------------------------------------------------
  // Load appointments from backend when the page loads
  // --------------------------------------------------------------
  useEffect(() => {
    const loadAppointments = async () => {
      try {
        if (!user?.id) {
          setError("User session not found.");
          setLoading(false);
          return;
        }

        const result = await patientAPI.getAppointments(user.id);

        if (!result.success) {
          setError(result.message || "Failed to load appointments.");
        } else {
          setAppointments(result.data || []);
        }
      } catch (err) {
        setError("Error loading appointments.");
        console.error("Appointment load error:", err);
      }

      setLoading(false);
    };

    loadAppointments();
  }, [user]);

  // --------------------------------------------------------------
  // Status colour styling based on appointment state
  // --------------------------------------------------------------
  const getStatusClass = (status: string) => {
    switch (status) {
      case "Upcoming":
        return "text-blue-700 bg-blue-100";
      case "Completed":
        return "text-green-700 bg-green-100";
      case "Cancelled":
        return "text-red-700 bg-red-100";
      default:
        return "text-gray-700 bg-gray-100";
    }
  };

  // Grouping for UI
  const upcoming = appointments.filter((a) => a.status === "Upcoming");
  const past = appointments.filter((a) => a.status !== "Upcoming");

  // --------------------------------------------------------------
  // RENDER
  // --------------------------------------------------------------
  return (
    <div className="space-y-8 pb-10">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Appointments</h1>
        <p className="text-gray-600">
          View your upcoming and past medical appointments.
        </p>
      </div>

      {/* Loading */}
      {loading && <p className="text-gray-500">Loading appointments...</p>}

      {/* Error display */}
      {!loading && error && (
        <p className="text-red-600 font-medium">{error}</p>
      )}

      {/* Only show when loaded and no error */}
      {!loading && !error && (
        <>
          {/* UPCOMING SECTION */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Upcoming Appointments</h2>

            {upcoming.length === 0 && (
              <p className="text-gray-500 italic">
                No upcoming appointments scheduled.
              </p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {upcoming.map((appt) => (
                <div
                  key={appt.appointmentId}
                  className="p-5 bg-white rounded-xl shadow hover:shadow-lg transition hover:-translate-y-1 border border-gray-200"
                >
                  {/* Header */}
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">
                      Appointment #{appt.appointmentId}
                    </h3>
                    <span
                      className={`px-3 py-1 text-sm rounded-full font-medium ${getStatusClass(
                        appt.status
                      )}`}
                    >
                      {appt.status}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="mt-4 text-sm space-y-2">
                    <p><strong>Doctor:</strong> {appt.doctorName}</p>
                    <p><strong>Location:</strong> {appt.location}</p>
                    <p><strong>Date:</strong> {appt.appointmentDate}</p>
                  </div>

                  {/* Button – opens modal */}
                  <div className="mt-4">
                    <button
                      onClick={() => {
                        setSelectedAppt(appt);
                        setShowModal(true);
                      }}
                      className="w-full py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* PAST SECTION */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Past Appointments</h2>

            {past.length === 0 && (
              <p className="text-gray-500 italic">No past appointments.</p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {past.map((appt) => (
                <div
                  key={appt.appointmentId}
                  className="p-5 bg-gray-50 rounded-xl border shadow-sm hover:shadow-md transition hover:-translate-y-1"
                >
                  {/* Header */}
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">
                      Appointment #{appt.appointmentId}
                    </h3>
                    <span
                      className={`px-3 py-1 text-sm rounded-full font-medium ${getStatusClass(
                        appt.status
                      )}`}
                    >
                      {appt.status}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="mt-4 text-sm space-y-2">
                    <p><strong>Doctor:</strong> {appt.doctorName}</p>
                    <p><strong>Location:</strong> {appt.location}</p>
                    <p><strong>Date:</strong> {appt.appointmentDate}</p>
                  </div>

                  {/* Button – also opens modal */}
                  <div className="mt-4">
                    <button
                      onClick={() => {
                        setSelectedAppt(appt);
                        setShowModal(true);
                      }}
                      className="w-full py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-800 transition"
                    >
                      View Summary
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {/* --------------------------------------------------------------
          MODAL – Appointment Details Popup
         -------------------------------------------------------------- */}
      {showModal && selectedAppt && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">
              Appointment #{selectedAppt.appointmentId}
            </h2>

            <p><strong>Doctor:</strong> {selectedAppt.doctorName}</p>
            <p><strong>Location:</strong> {selectedAppt.location}</p>
            <p><strong>Date:</strong> {selectedAppt.appointmentDate}</p>
            <p><strong>Status:</strong> {selectedAppt.status}</p>

            {selectedAppt.status === "Upcoming" && (
              <button
                onClick={() => setShowConfirmCancel(true)}
                className="w-full mt-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
              >
                Cancel Appointment
              </button>
            )}

            <button
              onClick={() => setShowModal(false)}
              className="w-full mt-2 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-800 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------
          CONFIRMATION POPUP – Are you sure you want to cancel?
         -------------------------------------------------------------- */}
      {showConfirmCancel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-sm">
            <h3 className="text-xl font-semibold mb-4">Cancel Appointment?</h3>
            <p className="text-gray-700 mb-4">
              Are you sure you want to cancel this appointment?
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  console.log("Appointment cancelled (TODO: backend API)");
                  setShowConfirmCancel(false);
                  setShowModal(false);
                }}
                className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Yes, Cancel
              </button>

              <button
                onClick={() => setShowConfirmCancel(false)}
                className="flex-1 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400"
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
