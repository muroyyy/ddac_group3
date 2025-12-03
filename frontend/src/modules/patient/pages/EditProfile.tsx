import { useState } from "react";

// This page allows the patient to update their profile info.
// Right now, the form saves locally inside React only.
// Later, this form will send a PUT request to your backend.

export default function EditProfile() {

  // ---------------- INITIAL MOCK PROFILE VALUES --------------------
  // These values appear in the form when the page loads.
  // Later, you will replace this with GET /api/patient/{id}/profile.

  const [fullName, setFullName] = useState("Sharveen Patient");
  const [email, setEmail] = useState("patient@example.com");
  const [phone, setPhone] = useState("012-3456789");
  const [bloodTypeNeeded, setBloodTypeNeeded] = useState("O+");
  const [urgencyLevel, setUrgencyLevel] = useState("High");
  const [conditionDescription, setConditionDescription] = useState(
    "Requires regular transfusion for chronic anemia."
  );

  // This will show a temporary "Profile Updated" message.
  const [saved, setSaved] = useState(false);


  // ---------------- HANDLE FORM SUBMISSION --------------------
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    // For now, save only in React state.
    // Later: Replace with PUT /api/patient/{id}/profile.
    setSaved(true);

    console.log("Mock profile update submitted:", {
      fullName,
      email,
      phone,
      bloodTypeNeeded,
      urgencyLevel,
      conditionDescription,
    });
  };


  // ========================== UI LAYOUT ==============================

  return (
    <div className="max-w-2xl bg-white p-6 rounded-lg shadow space-y-6">

      {/* HEADER */}
      <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
      <p className="text-gray-600">Update your medical and personal details.</p>

      {/* SUCCESS MESSAGE */}
      {saved && (
        <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          ✔ Profile updated (mock only).  
          <br />
          No backend calls yet.
        </div>
      )}

      {/* FORM START */}
      <form onSubmit={handleSave} className="space-y-4">

        {/* FULL NAME */}
        <div>
          <label className="block font-medium mb-1">Full Name</label>
          <input
            className="border p-2 rounded w-full"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </div>

        {/* EMAIL */}
        <div>
          <label className="block font-medium mb-1">Email Address</label>
          <input
            type="email"
            className="border p-2 rounded w-full"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {/* PHONE NUMBER */}
        <div>
          <label className="block font-medium mb-1">Phone Number</label>
          <input
            className="border p-2 rounded w-full"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        {/* BLOOD TYPE NEEDED */}
        <div>
          <label className="block font-medium mb-1">Blood Type Needed</label>
          <select
            className="border p-2 rounded w-full"
            value={bloodTypeNeeded}
            onChange={(e) => setBloodTypeNeeded(e.target.value)}
            required
          >
            <option value="A+">A+</option><option value="A-">A-</option>
            <option value="B+">B+</option><option value="B-">B-</option>
            <option value="AB+">AB+</option><option value="AB-">AB-</option>
            <option value="O+">O+</option><option value="O-">O-</option>
          </select>
        </div>

        {/* URGENCY LEVEL */}
        <div>
          <label className="block font-medium mb-1">Urgency Level</label>
          <select
            className="border p-2 rounded w-full"
            value={urgencyLevel}
            onChange={(e) => setUrgencyLevel(e.target.value)}
          >
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
            <option>Critical</option>
          </select>
        </div>

        {/* CONDITION DESCRIPTION */}
        <div>
          <label className="block font-medium mb-1">Medical Condition</label>
          <textarea
            rows={4}
            className="border p-2 rounded w-full"
            value={conditionDescription}
            onChange={(e) => setConditionDescription(e.target.value)}
          ></textarea>
        </div>

        {/* SAVE BUTTON */}
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
        >
          Save Changes
        </button>

      </form>

    </div>
  );
}
