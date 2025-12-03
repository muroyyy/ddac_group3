import { useState } from "react";

// Edit Profile page for patient.
// UI has been upgraded to match a modern medical dashboard design.

export default function EditProfile() {
  // ---------------- INITIAL MOCK VALUES --------------------
  const [fullName, setFullName] = useState("Sharveen Patient");
  const [email, setEmail] = useState("patient@example.com");
  const [phone, setPhone] = useState("012-3456789");
  const [bloodTypeNeeded, setBloodTypeNeeded] = useState("O+");
  const [urgencyLevel, setUrgencyLevel] = useState("High");
  const [conditionDescription, setConditionDescription] = useState(
    "Requires regular transfusion for chronic anemia."
  );

  const [saved, setSaved] = useState(false);

  // ---------------- HANDLE FORM SUBMISSION --------------------
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
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

  return (
    <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-md space-y-6 border border-gray-200">

      {/* ---------------- PAGE HEADER ---------------- */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Edit Profile</h1>
        <p className="text-gray-600 mt-1">
          Update your personal and medical information below.
        </p>
      </div>

      {/* ---------------- SUCCESS MESSAGE ---------------- */}
      {saved && (
        <div className="p-4 bg-green-50 border border-green-300 text-green-700 rounded-lg shadow-sm">
          <strong>✔ Profile updated successfully!</strong>
          <p className="text-sm">This is currently mock-only. Backend integration coming later.</p>
        </div>
      )}

      {/* ---------------- FORM ---------------- */}
      <form onSubmit={handleSave} className="space-y-6">

        {/* SECTION: PERSONAL DETAILS */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-3 border-l-4 border-red-500 pl-3">
            Personal Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* FULL NAME */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Full Name
              </label>
              <input
                className="border rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-red-400"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            {/* EMAIL */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Email Address
              </label>
              <input
                type="email"
                className="border rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-red-400"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* PHONE NUMBER */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Phone Number
              </label>
              <input
                className="border rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-red-400"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

          </div>
        </div>

        {/* SECTION: MEDICAL DETAILS */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-3 border-l-4 border-red-500 pl-3">
            Medical Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* BLOOD TYPE */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Blood Type Needed
              </label>
              <select
                className="border rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-red-400"
                value={bloodTypeNeeded}
                onChange={(e) => setBloodTypeNeeded(e.target.value)}
              >
                <option>A+</option><option>A-</option>
                <option>B+</option><option>B-</option>
                <option>AB+</option><option>AB-</option>
                <option>O+</option><option>O-</option>
              </select>
            </div>

            {/* URGENCY LEVEL */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Urgency Level
              </label>
              <select
                className="border rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-red-400"
                value={urgencyLevel}
                onChange={(e) => setUrgencyLevel(e.target.value)}
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
                <option>Critical</option>
              </select>
            </div>

          </div>

          {/* CONDITION DESCRIPTION */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Medical Condition
            </label>
            <textarea
              rows={4}
              className="border rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-red-400"
              value={conditionDescription}
              onChange={(e) => setConditionDescription(e.target.value)}
            ></textarea>
          </div>
        </div>

        {/* ---------------- SAVE BUTTON ---------------- */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition shadow-sm font-semibold"
          >
            Save Changes
          </button>
        </div>

      </form>
    </div>
  );
}
