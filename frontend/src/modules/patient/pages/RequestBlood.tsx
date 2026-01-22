import { useState, useEffect } from "react";
import { patientAPI } from '../../../api';
import { useAuth } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Edit } from "lucide-react";

export default function RequestBlood() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== "patient") {
      alert("Only patients can access this page.");
      navigate("/login");
      return;
    }
  }, [user, navigate]);

  const [bloodType, setBloodType] = useState("");
  const [units, setUnits] = useState("");
  const [urgency, setUrgency] = useState("");
  const [hospital, setHospital] = useState("");
  const [notes, setNotes] = useState("");
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!user?.id) return;
      
      try {
        const [profileResult, hospitalsResult] = await Promise.all([
          patientAPI.getProfile(user.id),
          patientAPI.getHospitals()
        ]);
        
        if (profileResult.success && profileResult.data.bloodTypeNeeded) {
          setBloodType(profileResult.data.bloodTypeNeeded);
        }
        
        if (hospitalsResult.success) {
          setHospitals(hospitalsResult.data);
        }
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id) {
      alert("User session missing. Please relogin.");
      navigate("/login");
      return;
    }

    const payload = {
      bloodType,
      unitsRequired: Number(units),
      urgencyLevel: urgency,
      hospitalId: Number(hospital),
      notes,
    };

    try {
      const response = await patientAPI.createBloodRequest(user.id, payload);

      if (response.success) {
        setSubmitted(true);
      } else {
        alert(response.message || "Something went wrong.");
      }
    } catch (error) {
      console.error("API error:", error);
      alert("Failed to submit blood request.");
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Request Blood</h1>

      {submitted && (
        <div className="bg-green-50 p-4 border border-green-300 rounded-lg">
          <strong>✔ Request submitted successfully!</strong>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-md border space-y-6">
        <h2 className="text-xl font-semibold">Blood Request Details</h2>

        <div>
          <label className="block mb-1">Blood Type</label>
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={bloodType || "Not set in profile"}
              readOnly
              className="border rounded-lg p-2 flex-1 bg-gray-50 cursor-not-allowed"
            />
            <button
              type="button"
              onClick={() => navigate('/patient/profile')}
              className="flex items-center gap-2 px-3 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 cursor-pointer"
            >
              <Edit className="w-4 h-4" />
              Edit in Profile
            </button>
          </div>
          {!bloodType && (
            <p className="text-red-600 text-sm mt-1">
              Please set your blood type in your profile first.
            </p>
          )}
        </div>

        <div>
          <label className="block mb-1">Units Required</label>
          <input
            type="number"
            min="1"
            value={units}
            onChange={(e) => setUnits(e.target.value)}
            required
            className="border rounded-lg p-2 w-full"
          />
        </div>

        <div>
          <label className="block mb-1">Urgency</label>
          <select
            value={urgency}
            onChange={(e) => setUrgency(e.target.value)}
            required
            className="border rounded-lg p-2 w-full"
          >
            <option value="">Select urgency</option>
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
            <option>Critical</option>
          </select>
        </div>

        <div>
          <label className="block mb-1">Hospital</label>
          <select
            value={hospital}
            onChange={(e) => setHospital(e.target.value)}
            required
            className="border rounded-lg p-2 w-full"
          >
            <option value="">Select hospital</option>
            {hospitals.map((h) => (
              <option key={h.hospitalId} value={h.hospitalId}>
                {h.hospitalName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1">Notes (Optional)</label>
          <textarea
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="border rounded-lg p-2 w-full"
          />
        </div>

        <button
          type="submit"
          disabled={!bloodType}
          className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer"
        >
          Submit Request
        </button>
      </form>
    </div>
  );
}