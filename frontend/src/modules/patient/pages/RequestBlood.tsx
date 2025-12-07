import { useState, useEffect } from "react";
import { patientAPI } from "../../../utils/apiClient";
import { useAuth } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function RequestBlood() {
  const { user } = useAuth(); // Get logged-in user from AuthContext
  const navigate = useNavigate();

  // Redirect if not patient
  useEffect(() => {
    if (!user || user.role !== "patient") {
      alert("Only patients can access this page.");
      navigate("/login");
      return;
    }
  }, [user, navigate]);

  // ---------------- FORM STATE ----------------
  const [bloodType, setBloodType] = useState("");
  const [units, setUnits] = useState("");
  const [urgency, setUrgency] = useState("");
  const [hospital, setHospital] = useState("");
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const mockHospitals = [
    { id: 1, name: "City General Hospital" },
    { id: 2, name: "Sunway Medical Centre" },
    { id: 3, name: "Gleneagles KL" },
  ];

  // ---------------- HANDLE SUBMIT ----------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id) {
      alert("User session missing. Please relogin.");
      navigate("/login");
      return;
    }

    // Payload matching backend DTO
    const payload = {
      bloodType,
      unitsRequired: Number(units),
      urgencyLevel: urgency,
      hospitalId: Number(hospital),
      notes,
    };

    try {
      // Send userId + form data to backend
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

  // ---------------- UI ----------------
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Request Blood</h1>

      {submitted && (
        <div className="bg-green-50 p-4 border border-green-300 rounded-lg">
          <strong>✔ Request submitted successfully!</strong>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-md border space-y-6"
      >
        <h2 className="text-xl font-semibold">Blood Request Details</h2>

        {/* BLOOD TYPE */}
        <div>
          <label className="block mb-1">Blood Type</label>
          <select
            value={bloodType}
            onChange={(e) => setBloodType(e.target.value)}
            required
            className="border rounded-lg p-2 w-full"
          >
            <option value="">Select blood type</option>
            <option>A+</option><option>A-</option>
            <option>B+</option><option>B-</option>
            <option>AB+</option><option>AB-</option>
            <option>O+</option><option>O-</option>
          </select>
        </div>

        {/* UNITS */}
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

        {/* URGENCY */}
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

        {/* HOSPITAL */}
        <div>
          <label className="block mb-1">Hospital</label>
          <select
            value={hospital}
            onChange={(e) => setHospital(e.target.value)}
            required
            className="border rounded-lg p-2 w-full"
          >
            <option value="">Select hospital</option>
            {mockHospitals.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </select>
        </div>

        {/* NOTES */}
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
          className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
        >
          Submit Request
        </button>
      </form>
    </div>
  );
}
