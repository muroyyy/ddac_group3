import { CalendarDays, MapPin, User2, History } from "lucide-react";

export default function Appointments() {
  /* 
  ---------------------------------------------------------------
  MOCK APPOINTMENT DATA
  ---------------------------------------------------------------
  - This represents what your backend will eventually return.
  - Good for building UI early without API implementation.
  ---------------------------------------------------------------
  */
  const mockAppointments = [
    {
      appointmentId: 1,
      doctor: "Dr. Farah Hussein",
      location: "City General Hospital",
      date: "2025-12-05 10:00 AM",
      status: "Upcoming",
    },
    {
      appointmentId: 2,
      doctor: "Dr. Raymond Tan",
      location: "Sunway Medical Centre",
      date: "2025-11-20 02:00 PM",
      status: "Completed",
    },
    {
      appointmentId: 3,
      doctor: "Dr. Priya Singh",
      location: "Gleneagles Kuala Lumpur",
      date: "2025-10-30 09:00 AM",
      status: "Cancelled",
    },
  ];

  /* 
  ---------------------------------------------------------------
  FUNCTION: getStatusClass()
  ---------------------------------------------------------------
  - Determines the color of the status badge.
  - Matches your database ENUM values.
  ---------------------------------------------------------------
  */
  const getStatusClass = (status: string) => {
    switch (status) {
      case "Upcoming":
        return "text-blue-700 bg-blue-100"; // Blue badge
      case "Completed":
        return "text-green-700 bg-green-100"; // Green badge
      case "Cancelled":
        return "text-red-700 bg-red-100"; // Red badge
      default:
        return "text-gray-700 bg-gray-100";
    }
  };

  /* 
  ---------------------------------------------------------------
  GROUPING APPOINTMENTS
  ---------------------------------------------------------------
  - Useful for dashboards and separating "future" vs "past".
  ---------------------------------------------------------------
  */
  const upcoming = mockAppointments.filter(a => a.status === "Upcoming");
  const past = mockAppointments.filter(a => a.status !== "Upcoming");

  /* 
  =================================================================
  RENDER UI
  =================================================================
  */
  return (
    <div className="space-y-8">
      
      {/* ===================== PAGE HEADER ===================== */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Appointments</h1>
        <p className="text-gray-600 mt-1">
          Track your scheduled and past medical appointments.
        </p>
      </div>

      {/* ===================== UPCOMING SECTION ===================== */}
      <section className="bg-white p-6 rounded-xl shadow-sm border">

        {/* Section Title */}
        <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-blue-600" />
          Upcoming Appointments
        </h2>

        {/* Case: No upcoming appointments */}
        {upcoming.length === 0 ? (
          <p className="text-gray-500 italic">No upcoming appointments.</p>
        ) : (
          <div className="space-y-4">
            {upcoming.map((appt) => (
              <div
                key={appt.appointmentId}
                className="border rounded-lg p-4 bg-blue-50 hover:bg-blue-100 transition"
              >

                {/* Top Row → Appointment ID + Status Badge */}
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm text-gray-600">
                    Appointment #{appt.appointmentId}
                  </span>

                  {/* Status badge */}
                  <span
                    className={`px-3 py-1 text-sm rounded-full font-medium ${getStatusClass(
                      appt.status
                    )}`}
                  >
                    {appt.status}
                  </span>
                </div>

                {/* Appointment Details (Doctor, Location, Date) */}
                <div className="space-y-1">
                  <p className="flex items-center gap-2 text-gray-800">
                    <User2 className="w-4 h-4 text-blue-700" />
                    <strong>Doctor:</strong> {appt.doctor}
                  </p>

                  <p className="flex items-center gap-2 text-gray-800">
                    <MapPin className="w-4 h-4 text-blue-700" />
                    <strong>Location:</strong> {appt.location}
                  </p>

                  <p className="flex items-center gap-2 text-gray-800">
                    <CalendarDays className="w-4 h-4 text-blue-700" />
                    <strong>Date:</strong> {appt.date}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ===================== PAST APPOINTMENTS ===================== */}
      <section className="bg-white p-6 rounded-xl shadow-sm border">

        {/* Section Title */}
        <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
          <History className="w-5 h-5 text-gray-700" />
          Past Appointments
        </h2>

        {/* Case: No past appointments */}
        {past.length === 0 ? (
          <p className="text-gray-500 italic">No past appointments.</p>
        ) : (
          <div className="space-y-4">
            {past.map((appt) => (
              <div
                key={appt.appointmentId}
                className="border rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition"
              >

                {/* Top Row: ID + Status */}
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm text-gray-600">
                    Appointment #{appt.appointmentId}
                  </span>

                  <span
                    className={`px-3 py-1 text-sm rounded-full font-medium ${getStatusClass(
                      appt.status
                    )}`}
                  >
                    {appt.status}
                  </span>
                </div>

                {/* Appointment Detail Info */}
                <div className="space-y-1 text-gray-800">
                  <p className="flex items-center gap-2">
                    <User2 className="w-4 h-4 text-gray-600" />
                    <strong>Doctor:</strong> {appt.doctor}
                  </p>

                  <p className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-600" />
                    <strong>Location:</strong> {appt.location}
                  </p>

                  <p className="flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-gray-600" />
                    <strong>Date:</strong> {appt.date}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
