import { useState, useEffect } from "react";

// This page displays ALL previous blood requests (mocked for now).

export default function ViewRequests() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock dataset (later replace with backend GET /patient/requests)
  const mockRequests = [
    {
      id: 1,
      bloodType: "O+",
      units: 2,
      urgency: "High",
      hospital: "City General Hospital",
      status: "Pending",
      date: "2025-01-12",
    },
    {
      id: 2,
      bloodType: "A-",
      units: 1,
      urgency: "Medium",
      hospital: "Sunway Medical Centre",
      status: "Approved",
      date: "2025-01-05",
    },
    {
      id: 3,
      bloodType: "B+",
      units: 3,
      urgency: "Critical",
      hospital: "Gleneagles KL",
      status: "Fulfilled",
      date: "2025-01-01",
    },
  ];

  useEffect(() => {
    // simulate loading
    setTimeout(() => {
      setRequests(mockRequests);
      setLoading(false);
    }, 500);
  }, []);

  if (loading) {
    return <div className="text-center p-6">Loading your requests...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">My Blood Requests</h1>
      <p className="text-gray-600">View all blood requests you have submitted.</p>

      <div className="bg-white shadow rounded-lg p-6">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-3 border">Request ID</th>
              <th className="p-3 border">Blood Type</th>
              <th className="p-3 border">Units</th>
              <th className="p-3 border">Urgency</th>
              <th className="p-3 border">Hospital</th>
              <th className="p-3 border">Status</th>
              <th className="p-3 border">Date</th>
            </tr>
          </thead>

          <tbody>
            {requests.map((req) => (
              <tr key={req.id} className="hover:bg-gray-50">
                <td className="p-3 border">{req.id}</td>
                <td className="p-3 border">{req.bloodType}</td>
                <td className="p-3 border">{req.units}</td>
                <td className="p-3 border">{req.urgency}</td>
                <td className="p-3 border">{req.hospital}</td>
                <td
                  className={`p-3 border font-semibold ${
                    req.status === "Pending"
                      ? "text-yellow-600"
                      : req.status === "Approved"
                      ? "text-blue-600"
                      : req.status === "Rejected"
                      ? "text-red-600"
                      : "text-green-600"
                  }`}
                >
                  {req.status}
                </td>
                <td className="p-3 border">{req.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
