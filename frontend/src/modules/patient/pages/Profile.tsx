import { useAuth } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";

/**
 * Patient Profile Page
 * ---------------------------------------------------------
 * Displays the patient's medical + personal details.
 * Uses MOCK DATA for now so the frontend can run
 * even before backend API development is completed.
 *
 * Later: Replace with GET /api/patient/{id}/profile (real backend)
 */
export default function Profile() {

  // Read logged-in user details from AuthContext
  const { user } = useAuth();

  // React Router navigation hook
  const navigate = useNavigate();

  /**
   * MOCK PROFILE DATA
   * -------------------------------------------------------
   * These values will eventually come from your database.
   * For now, they allow you to build a fully functional UI.
   */
  const mockProfile = {
    fullName: user?.name ?? "Sharveen Patient",
    email: user?.email ?? "patient@example.com",
    phone: "012-3456789",
    bloodTypeNeeded: "O+",
    conditionDescription: "Requires regular transfusion for chronic anemia.",
    urgencyLevel: "High",
    hospitalPreference: "City General Hospital",
  };

  // ========================== PAGE UI ==============================

  return (
    <div className="max-w-2xl bg-white p-6 rounded-lg shadow space-y-5">

      {/* -------------------- PAGE HEADER -------------------- */}
      <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
      <p className="text-gray-600">
        Review your medical and personal details.
      </p>

      {/* -------------------- PROFILE DETAILS -------------------- */}
      <div className="space-y-4">

        {/* FULL NAME */}
        <div>
          <h2 className="text-sm font-semibold text-gray-500">Full Name</h2>
          <p className="text-lg">{mockProfile.fullName}</p>
        </div>

        {/* EMAIL ADDRESS */}
        <div>
          <h2 className="text-sm font-semibold text-gray-500">Email Address</h2>
          <p>{mockProfile.email}</p>
        </div>

        {/* PHONE NUMBER */}
        <div>
          <h2 className="text-sm font-semibold text-gray-500">Phone Number</h2>
          <p>{mockProfile.phone}</p>
        </div>

        {/* BLOOD TYPE */}
        <div>
          <h2 className="text-sm font-semibold text-gray-500">Blood Type Needed</h2>
          <p>{mockProfile.bloodTypeNeeded}</p>
        </div>

        {/* MEDICAL CONDITION */}
        <div>
          <h2 className="text-sm font-semibold text-gray-500">Medical Condition</h2>
          <p className="leading-relaxed text-gray-700">
            {mockProfile.conditionDescription}
          </p>
        </div>

        {/* URGENCY LEVEL */}
        <div>
          <h2 className="text-sm font-semibold text-gray-500">Urgency Level</h2>
          <p className="text-red-600 font-semibold">
            {mockProfile.urgencyLevel}
          </p>
        </div>

        {/* PREFERRED HOSPITAL */}
        <div>
          <h2 className="text-sm font-semibold text-gray-500">Preferred Hospital</h2>
          <p>{mockProfile.hospitalPreference}</p>
        </div>

      </div>

      {/* -------------------- EDIT PROFILE BUTTON -------------------- */}
      <button
        onClick={() => navigate("/patient/edit-profile")}
        className="w-full mt-6 px-6 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition font-medium"
      >
        Edit Profile
      </button>

    </div>
  );
}
