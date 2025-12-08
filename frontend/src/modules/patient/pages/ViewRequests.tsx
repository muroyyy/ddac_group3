import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { patientAPI } from "../../../utils/apiClient";
import { useAuth } from "../../../context/AuthContext";

export default function ViewRequests() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [requests, setRequests] = useState<any[]>([]);
  const [filter, setFilter] = useState(searchParams.get("filter") || "All");
  const [loading, setLoading] = useState(true);

  // Load real requests from backend
  useEffect(() => {
    if (!user?.id) return; // ⛔ prevent calling API before user loads

    const loadRequests = async () => {
      try {
        const res = await patientAPI.getMyRequests(user.id); // ✅ now user.id exists

        if (res.success) {
          setRequests(res.data);
        }
      } catch (err) {
        console.error("❌ Failed to load blood requests:", err);
      } finally {
        setLoading(false);
      }
    };

    loadRequests();
  }, [user]); // ✅ re-run when user becomes available

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

  // Filter requests by status
  const filteredRequests =
    filter === "All"
      ? requests
      : requests.filter((req) => req.status === filter);

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Blood Requests</h1>
        <p className="text-gray-600">View all blood requests you have submitted.</p>
      </div>

      {/* FILTER BUTTONS */}
      <div className="flex gap-3 mb-4">
        {["All", "Pending", "Approved", "Fulfilled", "Rejected"].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg border transition ${
              filter === status
                ? "bg-red-600 text-white border-red-600"
                : "bg-white text-gray-700 border-gray-300"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* LOADING */}
      {loading && <p className="text-center text-gray-600 py-10">Loading...</p>}

      {/* EMPTY */}
      {!loading && filteredRequests.length === 0 && (
        <p className="text-center text-gray-600 py-10">No requests found.</p>
      )}

      {/* TABLE */}
      {!loading && filteredRequests.length > 0 && (
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
              {filteredRequests.map((req) => (
                <tr key={req.id} className="border-b hover:bg-gray-50 transition cursor-pointer">
                  <td className="px-6 py-3">{req.id}</td>
                  <td className="px-6 py-3 font-medium">{req.bloodType}</td>
                  <td className="px-6 py-3">{req.units}</td>
                  <td className="px-6 py-3">{req.urgency}</td>
                  <td className="px-6 py-3">{req.hospitalName || `Hospital ${req.hospitalId}`}</td>
                  <td className="px-6 py-3">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        req.status
                      )}`}
                    >
                      {req.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-gray-600">{req.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
