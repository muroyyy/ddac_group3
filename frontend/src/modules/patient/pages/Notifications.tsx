import { useState } from "react";

// This page displays notifications for the patient.
// Right now, everything is mock data only.
// Later, this will fetch: GET /api/patient/{id}/notifications

export default function Notifications() {

  // ---------------- MOCK NOTIFICATION LIST --------------------
  // These notifications will later come from your backend.
  // For now we hardcode them to see how the UI looks.

  const [notifications] = useState([
    {
      id: 1,
      message: "Your blood request has been approved.",
      status: "Approved",
      createdAt: "2025-02-18 10:00 AM",
    },
    {
      id: 2,
      message: "Your request is still being reviewed.",
      status: "Pending",
      createdAt: "2025-02-17 4:30 PM",
    },
    {
      id: 3,
      message: "Your previous request has been fulfilled.",
      status: "Fulfilled",
      createdAt: "2025-02-10 9:15 AM",
    },
    {
      id: 4,
      message: "Your blood request was rejected. Contact hospital for details.",
      status: "Rejected",
      createdAt: "2025-02-08 3:00 PM",
    },
  ]);

  // ---------------- STATUS COLOR MAPPER --------------------
  // This function decides what background color each notification should have.

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved":
        return "bg-green-100 text-green-800 border-green-300";
      case "Pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "Rejected":
        return "bg-red-100 text-red-800 border-red-300";
      case "Fulfilled":
        return "bg-blue-100 text-blue-800 border-blue-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };


  // ========================== UI LAYOUT ==============================

  return (
    <div className="max-w-3xl bg-white p-6 rounded-lg shadow space-y-6">

      {/* PAGE HEADER */}
      <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
      <p className="text-gray-600">Stay updated with your request status.</p>

      {/* EMPTY STATE HANDLING */}
      {notifications.length === 0 && (
        <div className="text-center text-gray-500 py-10">
          No notifications available.
        </div>
      )}

      {/* NOTIFICATION LIST */}
      <div className="space-y-4">

        {notifications.map((note) => (
          <div
            key={note.id}
            className={`border p-4 rounded-lg shadow-sm ${getStatusColor(note.status)}`}
          >
            {/* Notification Message */}
            <div className="font-semibold text-lg">{note.message}</div>

            {/* Additional Details */}
            <div className="text-sm mt-2 flex justify-between">

              <span className="italic">
                Status: <strong>{note.status}</strong>
              </span>

              <span className="text-gray-700">{note.createdAt}</span>
            </div>
          </div>
        ))}

      </div>
    </div>
  );
}
