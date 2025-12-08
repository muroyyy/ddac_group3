import { useAuth } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

/**
 * Patient Profile Page
 * ---------------------------------------------------------
 * Displays the patient's medical + personal details.
 * Replaces MOCK DATA with real data fetched from the backend.
 */
export default function Profile() {
  const { user } = useAuth(); // Fetch user data from AuthContext
  const navigate = useNavigate();

  // State to manage profile data and loading/error states
  const [profile, setProfile] = useState<any>(null);  // Store real profile data
  const [loading, setLoading] = useState(true);       // Loading state
  const [error, setError] = useState<string | null>(null); // Error handling state

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) return;

      try {
        const { patientAPI } = await import('../../../utils/apiClient');
        const result = await patientAPI.getProfile(user.id);
        if (result.success) {
          setProfile(result.data);
        } else {
          setError(result.message || 'Failed to fetch profile');
        }
      } catch (error: any) {
        setError(error.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  // ========================== PAGE UI ==============================

  // Show loading state if data is still being fetched
  if (loading) {
    return (
      <div className="max-w-2xl bg-white p-6 rounded-lg shadow space-y-5">
        <h1 className="text-2xl font-bold text-gray-900">Loading...</h1>
      </div>
    );
  }

  // Show error if fetching fails
  if (error) {
    return (
      <div className="max-w-2xl bg-white p-6 rounded-lg shadow space-y-5">
        <h1 className="text-2xl font-bold text-gray-900">Error</h1>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  // Show profile data if fetched successfully
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
          <p className="text-lg">{profile?.fullName ?? "N/A"}</p>
        </div>

        {/* EMAIL ADDRESS */}
        <div>
          <h2 className="text-sm font-semibold text-gray-500">Email Address</h2>
          <p>{profile?.email ?? "N/A"}</p>
        </div>

        {/* PHONE NUMBER */}
        <div>
          <h2 className="text-sm font-semibold text-gray-500">Phone Number</h2>
          <p>{profile?.phone ?? "N/A"}</p>
        </div>

        {/* BLOOD TYPE */}
        <div>
          <h2 className="text-sm font-semibold text-gray-500">Blood Type Needed</h2>
          <p>{profile?.bloodTypeNeeded ?? "N/A"}</p>
        </div>

        {/* MEDICAL CONDITION */}
        <div>
          <h2 className="text-sm font-semibold text-gray-500">Medical Condition</h2>
          <p className="leading-relaxed text-gray-700">
            {profile?.medicalCondition ?? "N/A"}
          </p>
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
