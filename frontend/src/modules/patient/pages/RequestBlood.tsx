import { useState } from "react";
import { patientAPI } from "../../../utils/apiClient";

// ---------------------------------------------------------------------------
// PATIENT BLOOD REQUEST FORM
// This page allows patients to request blood from a hospital.
// Currently: Fully frontend (mock-only). No backend API calls yet.
// Later: You will send POST → /api/patient/blood-request
// ---------------------------------------------------------------------------

export default function RequestBlood() {
  // --------------------- FORM STATE ---------------------
  // These values represent what the user types or selects.
  // Later: Replace with backend state or pre-filled suggestions.

  const [bloodType, setBloodType] = useState("");
  const [units, setUnits] = useState("");
  const [urgency, setUrgency] = useState("");
  const [hospital, setHospital] = useState("");
  const [notes, setNotes] = useState("");

  // Tracks if form submission is successful (mocked)
  const [submitted, setSubmitted] = useState(false);

  // --------------------- MOCK HOSPITAL LIST ---------------------
  const mockHospitals = [
    { id: 1, name: "City General Hospital" },
    { id: 2, name: "Sunway Medical Centre" },
    { id: 3, name: "Gleneagles KL" },
  ];

  // --------------------- HANDLE FORM SUBMISSION ---------------------
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  const payload = {
    bloodType,
    unitsRequired: Number(units),
    urgencyLevel: urgency,
    hospitalId: Number(hospital),
    notes,
  };

  try {
    const response = await patientAPI.createBloodRequest(payload);

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


  // ---------------------------------------------------------------------------
  // UI DESIGN — Upgraded & Professional
  // ---------------------------------------------------------------------------

  return (
    <div className="max-w-3xl mx-auto space-y-6">

      {/* --------------------- PAGE HEADER --------------------- */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Request Blood</h1>
        <p className="text-gray-600 mt-1">
          Submit a new blood request to your preferred hospital.
        </p>
      </div>

      {/* --------------------- SUCCESS ALERT --------------------- */}
      {submitted && (
        <div className="p-4 bg-green-50 border border-green-300 text-green-700 rounded-lg shadow-sm">
          <strong>✔ Request submitted successfully!</strong>
          <p className="text-sm">This is a mock submission. Backend coming later.</p>
        </div>
      )}

      {/* --------------------- FORM CARD --------------------- */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-md border border-gray-200 space-y-6"
      >
        {/* SECTION TITLE */}
        <h2 className="text-xl font-semibold text-gray-800 border-l-4 border-red-500 pl-3">
          Blood Request Details
        </h2>

        {/* --------------------- BLOOD TYPE --------------------- */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Blood Type
          </label>
          <select
            className="border rounded-lg p-2 w-full focus:ring-2 focus:ring-red-400 focus:outline-none"
            value={bloodType}
            onChange={(e) => setBloodType(e.target.value)}
            required
          >
            <option value="">Select blood type</option>
            <option>A+</option><option>A-</option>
            <option>B+</option><option>B-</option>
            <option>AB+</option><option>AB-</option>
            <option>O+</option><option>O-</option>
          </select>
        </div>

        {/* --------------------- UNITS + URGENCY (Grid Layout) --------------------- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* UNITS REQUIRED */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Units Required
            </label>
            <input
              type="number"
              className="border rounded-lg p-2 w-full focus:ring-2 focus:ring-red-400 focus:outline-none"
              placeholder="Example: 2"
              min="1"
              value={units}
              onChange={(e) => setUnits(e.target.value)}
              required
            />
          </div>

          {/* URGENCY LEVEL */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Urgency Level
            </label>
            <select
              className="border rounded-lg p-2 w-full focus:ring-2 focus:ring-red-400 focus:outline-none"
              value={urgency}
              onChange={(e) => setUrgency(e.target.value)}
              required
            >
              <option value="">Select urgency</option>
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
              <option>Critical</option>
            </select>
          </div>

        </div>

        {/* --------------------- HOSPITAL --------------------- */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Choose Hospital
          </label>

          <select
            className="border rounded-lg p-2 w-full focus:ring-2 focus:ring-red-400 focus:outline-none"
            value={hospital}
            onChange={(e) => setHospital(e.target.value)}
            required
          >
            <option value="">Select hospital</option>
            {mockHospitals.map((h) => (
              <option key={h.id} value={h.id}>{h.name}</option>
            ))}
          </select>
        </div>

        {/* --------------------- NOTES --------------------- */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Additional Notes (Optional)
          </label>
          <textarea
            rows={4}
            className="border rounded-lg p-3 w-full focus:ring-2 focus:ring-red-400 focus:outline-none"
            placeholder="Symptoms, doctor’s recommendation, reason for urgency, etc."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          ></textarea>
        </div>

        {/* --------------------- SUBMIT BUTTON --------------------- */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-red-600 text-white px-6 py-2 rounded-lg shadow-sm hover:bg-red-700 transition font-semibold"
          >
            Submit Request
          </button>
        </div>
      </form>
    </div>
  );
}
