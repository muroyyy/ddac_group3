import React from "react";

export default function ViewRequests() {
  // Temporary mock data
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "text-yellow-600 bg-yellow-100";
      case "Approved":
        return "text-blue-600 bg-blue-100";
      case "Fulfilled":
        return "text-green-600 bg-green-100";
      case "Rejected":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Blood Requests</h1>
        <p className="text-gray-600">View all blood requests you have submitted.</p>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left font-semibold text-gray-700">Request ID</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-700">Blood Type</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-700">Units</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-700">Urgency</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-700">Hospital</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-700">Status</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-700">Date</th>
            </tr>
          </thead>

          <tbody>
            {mockRequests.map((req) => (
              <tr key={req.id} className="border-b hover:bg-gray-50 transition">
                <td className="px-6 py-3">{req.id}</td>
                <td className="px-6 py-3 font-medium">{req.bloodType}</td>
                <td className="px-6 py-3">{req.units}</td>
                <td className="px-6 py-3">{req.urgency}</td>
                <td className="px-6 py-3">{req.hospital}</td>

                <td className="px-6 py-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(req.status)}`}>
                    {req.status}
                  </span>
                </td>

                <td className="px-6 py-3 text-gray-600">{req.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

