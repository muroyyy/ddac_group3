import { useAuth } from "../../../context/AuthContext";

// This page displays the patient's profile information.
// For now, the data is MOCK ONLY. Later you will fetch this from backend.
// Current goal: make the UI pages fully functional with mock data.

export default function Profile() {

  // Read logged-in user data from global AuthContext.
  // The login page sets this when the user logs in.
  const { user } = useAuth();

  // ---------------- MOCK PROFILE DATA --------------------
  // Later: replace this with GET /api/patient/{id}/profile
  // This helps your UI run even with no backend.
  const mockProfile = {
    fullName: user?.name ?? "Sharveen Patient",
    email: user?.email ?? "patient@example.com",
    phone: "012-3456789",
    bloodTypeNeeded: "O+",
    conditionDescription: "Requires regular transfusion for chronic anemia.",
    urgencyLevel: "High",
    hospitalPreference: "City General Hospital",
  };

  // ========================== UI LAYOUT ==============================

  return (
    <div className="max-w-2xl bg-white p-6 rounded-lg shadow space-y-5">

      {/* HEADER */}
      <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
      <p className="text-gray-600">Review your medical and personal details.</p>

      {/* PROFILE DETAILS CARD */}
      <div className="space-y-4">

        {/* FULL NAME */}
        <div>
          <h2 className="text-sm font-semibold text-gray-500">Full Name</h2>
          <p className="text-lg">{mockProfile.fullName}</p>
        </div>

        {/* EMAIL */}
        <div>
          <h2 className="text-sm font-semibold text-gray-500">Email Address</h2>
          <p>{mockProfile.email}</p>
        </div>

        {/* PHONE NUMBER */}
        <div>
          <h2 className="text-sm font-semibold text-gray-500">Phone Number</h2>
          <p>{mockProfile.phone}</p>
        </div>

        {/* BLOOD TYPE NEEDED */}
        <div>
          <h2 className="text-sm font-semibold text-gray-500">Blood Type Needed</h2>
          <p>{mockProfile.bloodTypeNeeded}</p>
        </div>

        {/* MEDICAL CONDITION */}
        <div>
          <h2 className="text-sm font-semibold text-gray-500">Medical Condition</h2>
          <p className="leading-relaxed text-gray-700">{mockProfile.conditionDescription}</p>
        </div>

        {/* URGENCY LEVEL */}
        <div>
          <h2 className="text-sm font-semibold text-gray-500">Urgency Level</h2>
          <p className="text-red-600 font-semibold">{mockProfile.urgencyLevel}</p>
        </div>

        {/* PREFERRED HOSPITAL */}
        <div>
          <h2 className="text-sm font-semibold text-gray-500">Preferred Hospital</h2>
          <p>{mockProfile.hospitalPreference}</p>
        </div>

      </div>

      {/* EDIT BUTTON (only navigates for now — real logic later) */}
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        onClick={() => alert("Later: navigate to Edit Profile page")}
      >
        Edit Profile
      </button>

    </div>
  );
}
