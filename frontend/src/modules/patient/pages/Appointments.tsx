import { useEffect, useState } from "react";
import { patientAPI } from "../../../utils/apiClient";
import { useAuth } from "../../../context/AuthContext";

interface Appointment {
  appointmentId: number;
  doctorName: string;
  location: string;
  appointmentDate: string;
  status: string;
}

export default function Appointments() {
  const { user } = useAuth();
  // --------------------------------------------------------------------
  // frontend states
  // --------------------------------------------------------------------
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // --------------------------------------------------------------------
  // LOAD APPOINTMENTS FROM BACKEND ON PAGE LOAD
  // GET /api/patient/appointments/{userId}
  // --------------------------------------------------------------------
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        if (!user?.id) {
          setError("User session not found.");
          return;
        }

        // call API
        const res = await patientAPI.getAppointments(user.id);

        // backend sends: { success: true, data: [...] }
        if (res.success) {
          setAppointments(res.data);
        } else {
          setError("Failed to load appointments.");
        }
      } catch (err) {
        setError("Unable to connect to the server.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // --------------------------------------------------------------------
  // helper: returns Tailwind classes based on appointment status
  // --------------------------------------------------------------------
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

  // --------------------------------------------------------------------
  // PAGE UI
  // --------------------------------------------------------------------
  return (
    <div className="space-y-8 pb-10">

      {/* --------------------- HEADER --------------------- */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Appointments</h1>
        <p className="text-gray-600">Your scheduled and completed appointments.</p>
      </div>

      {/* --------------------- LOADING STATE --------------------- */}
      {loading && <p className="text-gray-500">Loading appointments...</p>}

      {/* --------------------- ERROR STATE ---------------------- */}
      {error && <p className="text-red-600">{error}</p>}

      {/* SHOW PAGE ONLY WHEN DATA IS READY */}
      {!loading && !error && (
        <>
          {/* ======================================================
             UPCOMING APPOINTMENTS
          ====================================================== */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Upcoming Appointments</h2>

            {/* No upcoming appointments */}
            {upcoming.length === 0 && (
              <p className="text-gray-500 italic">No upcoming appointments.</p>
            )}

            {/* responsive grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {upcoming.map((appt) => (
                <div
                  key={appt.appointmentId}
                  className="p-5 bg-white rounded-xl shadow hover:shadow-lg transition hover:-translate-y-1 border border-gray-200"
                >
                  {/* top row */}
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

                  {/* details */}
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

                  {/* optional button */}
                  <div className="mt-4">
                    <button className="w-full py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition">
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ======================================================
             PAST APPOINTMENTS
          ====================================================== */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Past Appointments</h2>

            {/* No past appointments */}
            {past.length === 0 && (
              <p className="text-gray-500 italic">No past appointments found.</p>
            )}

            {/* responsive grid */}
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
}
