import { useState } from "react";

// This page allows the patient to "request blood".
// For now, everything is mockdata-only (no backend).

export default function RequestBlood() {

  // ----------- FORM STATE (TEMP VALUES UNTIL BACKEND READY) ----------

  // useState lets the input fields keep values in React.
  const [bloodType, setBloodType] = useState("");
  const [units, setUnits] = useState("");
  const [urgency, setUrgency] = useState("");
  const [hospital, setHospital] = useState("");
  const [notes, setNotes] = useState("");

  // This will show “Request Submitted” message
  const [submitted, setSubmitted] = useState(false);


  // ------------- MOCK HOSPITAL LIST ----------------
  const mockHospitals = [
    { id: 1, name: "City General Hospital" },
    { id: 2, name: "Sunway Medical Centre" },
    { id: 3, name: "Gleneagles KL" },
  ];

  // ------------- HANDLE FORM SUBMISSION ------------

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // For now we simply show a success message.
    // Later: send POST → backend.
    setSubmitted(true);

    console.log("Mock request submitted:", {
      bloodType,
      units,
      urgency,
      hospital,
      notes,
    });
  };


  // ====================== UI LAYOUT ===============================

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Request Blood</h1>

      <p className="text-gray-600">Submit a new blood request to your selected hospital.</p>

      {/* SUCCESS MESSAGE */}
      {submitted && (
        <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          Your request has been submitted (mock).  
        </div>
      )}

      {/* === FORM START === */}
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow">

        {/* BLOOD TYPE */}
        <div>
          <label className="block font-medium mb-1">Blood Type</label>
          <select
            className="border p-2 w-full rounded"
            value={bloodType}
            onChange={(e) => setBloodType(e.target.value)}
            required
          >
            <option value="">Select one</option>
            <option value="A+">A+</option><option value="A-">A-</option>
            <option value="B+">B+</option><option value="B-">B-</option>
            <option value="AB+">AB+</option><option value="AB-">AB-</option>
            <option value="O+">O+</option><option value="O-">O-</option>
          </select>
        </div>

        {/* UNITS REQUIRED */}
        <div>
          <label className="block font-medium mb-1">Units Required</label>
          <input
            type="number"
            className="border p-2 w-full rounded"
            placeholder="Example: 2"
            value={units}
            onChange={(e) => setUnits(e.target.value)}
            required
          />
        </div>

        {/* URGENCY */}
        <div>
          <label className="block font-medium mb-1">Urgency</label>
          <select
            className="border p-2 w-full rounded"
            value={urgency}
            onChange={(e) => setUrgency(e.target.value)}
            required
          >
            <option value="">Choose urgency</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
        </div>

        {/* HOSPITAL */}
        <div>
          <label className="block font-medium mb-1">Choose Hospital</label>
          <select
            className="border p-2 w-full rounded"
            value={hospital}
            onChange={(e) => setHospital(e.target.value)}
            required
          >
            <option value="">Select hospital</option>
            {mockHospitals.map(h => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </select>
        </div>

        {/* NOTES */}
        <div>
          <label className="block font-medium mb-1">Additional Notes (Optional)</label>
          <textarea
            className="border p-2 w-full rounded"
            rows={3}
            placeholder="Symptoms, doctor’s recommendation, etc."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          ></textarea>
        </div>

        {/* SUBMIT BUTTON */}
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Submit Request
        </button>

      </form>

    </div>
  );
}

