import React, { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { patientAPI } from "../../../utils/apiClient";
import type { Appointment } from "../../../types/Appointment";

const Appointments: React.FC = () => {
  // logged-in user from AuthContext
  const { user } = useAuth();

  // local state
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  // ----------------------------------------------------------
  // Load appointments when user is available
  // ----------------------------------------------------------
  useEffect(() => {
    // no user (not logged in) – do nothing
    if (!user) {
      setLoading(false);
      setError("You must be logged in to view appointments.");
      return;
    }

    const loadAppointments = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await patientAPI.getAppointments(user.id);

        // Expecting: { success: boolean, data: Appointment[] }
        if (response && response.success) {
          setAppointments(response.data as Appointment[]);
        } else {
          setError(response?.message || "Failed to load appointments.");
        }
      } catch (err: any) {
        console.error("Error loading appointments:", err);
        setError("Unable to connect to the server.");
      } finally {
        setLoading(false);
      }
    };

    loadAppointments();
  }, [user]);

  // ----------------------------------------------------------
  // helper – Tailwind classes by status
  // ----------------------------------------------------------
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

  // group appointments
  const upcoming = appointments.filter((a) => a.status === "Upcoming");
  const past = appointments.filter((a) => a.status !== "Upcoming");

  // ----------------------------------------------------------
  // RENDER
  // ----------------------------------------------------------
  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Appointments</h1>
        <p className="text-gray-600">
          View your upcoming and past medical appointments.
        </p>
      </div>

      {/* Loading */}
      {loading && <p className="text-gray-500">Loading appointments...</p>}

      {/* Error */}
      {!loading && error && (
        <p className="text-red-600 font-medium">{error}</p>
      )}

      {/* Only show sections when not loading and no error */}
      {!loading && !error && (
        <>
          {/* Upcoming */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">
              Upcoming Appointments
            </h2>

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

                  <div className="mt-4 text-sm space-y-2">
                    <p>
                      <strong>Doctor:</strong> {appt.doctorName}
                    </p>
                    <p>
                      <strong>Location:</strong> {appt.location}
                    </p>
                    <p>
                      <strong>Date:</strong> {appt.appointmentDate}
                    </p>
                  </div>

                  <div className="mt-4">
                    <button className="w-full py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition">
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Past */}
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

                  <div className="mt-4 text-sm space-y-2">
                    <p>
                      <strong>Doctor:</strong> {appt.doctorName}
                    </p>
                    <p>
                      <strong>Location:</strong> {appt.location}
                    </p>
                    <p>
                      <strong>Date:</strong> {appt.appointmentDate}
                    </p>
                  </div>

                  <div className="mt-4">
                    <button className="w-full py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-800 transition">
                      View Summary
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default Appointments;
