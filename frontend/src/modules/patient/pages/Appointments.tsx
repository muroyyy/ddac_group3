import { useState } from "react";

// This page displays *mock appointment data* for the patient.
// Later, you will replace this with a real API call.
// For now, this helps you complete the frontend layout.

export default function Appointments() {

  // ---------------- MOCK APPOINTMENT DATA --------------------
  // Exactly the same structure as your database table.
  // "status" matches your ENUM: Upcoming, Completed, Cancelled

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


  // ---------------- STATUS COLOR HELPER -----------------
  // Adds a color and background depending on appointment status.

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

  // ---------------- GROUPING APPOINTMENTS ----------------
  // You will often do this in dashboards:
  // Separate upcoming vs completed/cancelled.

  const upcoming = mockAppointments.filter(a => a.status === "Upcoming");
  const past = mockAppointments.filter(a => a.status !== "Upcoming");


  // ========================== PAGE UI ==============================

  return (
    <div className="space-y-6">

      {/* PAGE HEADER */}
      <h1 className="text-2xl font-bold text-gray-900">My Appointments</h1>
      <p className="text-gray-600">View your upcoming and past medical appointments.</p>


      {/* ========== UPCOMING APPOINTMENTS SECTION ========== */}
      <section>
        <h2 className="text-xl font-semibold mb-3">Upcoming Appointments</h2>

        {/* If no upcoming appointments */}
        {upcoming.length === 0 && (
          <p className="text-gray-500 italic">No upcoming appointments scheduled.</p>
        )}

        <div className="space-y-4">
          {upcoming.map((appt) => (
            <div
              key={appt.appointmentId}
              className="p-4 bg-white rounded-lg shadow border hover:shadow-md transition"
            >

              {/* Top row: doctor + status */}
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Appointment #{appt.appointmentId}</h3>

                <span
                  className={`px-3 py-1 text-sm rounded-full font-medium ${getStatusClass(
                    appt.status
                  )}`}
                >
                  {appt.status}
                </span>
              </div>

              {/* Appointment Details */}
              <div className="mt-3 text-sm space-y-1">
                <p><span className="font-semibold">Doctor:</span> {appt.doctor}</p>
                <p><span className="font-semibold">Location:</span> {appt.location}</p>
                <p><span className="font-semibold">Date:</span> {appt.date}</p>
              </div>
            </div>
          ))}
        </div>
      </section>


      {/* ========== PAST APPOINTMENTS SECTION ========== */}

      <section>
        <h2 className="text-xl font-semibold mb-3">Past Appointments</h2>

        {past.length === 0 && (
          <p className="text-gray-500 italic">No past appointments available.</p>
        )}

        <div className="space-y-4">
          {past.map((appt) => (
            <div
              key={appt.appointmentId}
              className="p-4 bg-gray-50 rounded-lg border shadow-sm"
            >

              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Appointment #{appt.appointmentId}</h3>
                <span
                  className={`px-3 py-1 text-sm rounded-full font-medium ${getStatusClass(
                    appt.status
                  )}`}
                >
                  {appt.status}
                </span>
              </div>

              <div className="mt-3 text-sm space-y-1">
                <p><span className="font-semibold">Doctor:</span> {appt.doctor}</p>
                <p><span className="font-semibold">Location:</span> {appt.location}</p>
                <p><span className="font-semibold">Date:</span> {appt.date}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
