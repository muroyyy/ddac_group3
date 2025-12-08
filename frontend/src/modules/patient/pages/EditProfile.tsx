import { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import { patientAPI } from "../../../utils/apiClient";
import { useNavigate } from "react-router-dom";

export default function EditProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [bloodTypeNeeded, setBloodTypeNeeded] = useState("");
  const [medicalCondition, setMedicalCondition] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [address, setAddress] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [allergies, setAllergies] = useState("");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.id) return;
      try {
        const result = await patientAPI.getProfile(user.id);
        if (result.success) {
          setFullName(result.data.fullName || "");
          setEmail(result.data.email || "");
          setPhone(result.data.phone || "");
          setBloodTypeNeeded(result.data.bloodTypeNeeded || "");
          setMedicalCondition(result.data.medicalCondition || "");
          setDateOfBirth(result.data.dateOfBirth || "");
          setAddress(result.data.address || "");
          setEmergencyContact(result.data.emergencyContact || "");
          setAllergies(result.data.allergies || "");
        }
      } catch (err) {
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    try {
      const result = await patientAPI.updateProfile(user.id, {
        fullName,
        email,
        phone,
        bloodTypeNeeded,
        medicalCondition,
        dateOfBirth,
        address,
        emergencyContact,
        allergies,
      });
      if (result.success) {
        setSaved(true);
        setTimeout(() => navigate("/patient/profile"), 2000);
      } else {
        setError(result.message || "Failed to update profile");
      }
    } catch (err) {
      setError("Error updating profile");
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-md space-y-6 border border-gray-200">

      {/* ---------------- PAGE HEADER ---------------- */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Edit Profile</h1>
        <p className="text-gray-600 mt-1">
          Update your personal and medical information below.
        </p>
      </div>

      {saved && (
        <div className="p-4 bg-green-50 border border-green-300 text-green-700 rounded-lg shadow-sm">
          <strong>✔ Profile updated successfully!</strong>
        </div>
      )}
      {error && (
        <div className="p-4 bg-red-50 border border-red-300 text-red-700 rounded-lg shadow-sm">
          {error}
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

            {/* DATE OF BIRTH */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                className="border rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-red-400"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
              />
            </div>

          </div>

          {/* ADDRESS */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Address
            </label>
            <textarea
              rows={2}
              className="border rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-red-400"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            ></textarea>
          </div>
        </div>

        {/* SECTION: EMERGENCY CONTACT */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-3 border-l-4 border-red-500 pl-3">
            Emergency Contact
          </h2>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Emergency Contact Phone
            </label>
            <input
              placeholder="e.g., 012-3456789"
              className="border rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-red-400"
              value={emergencyContact}
              onChange={(e) => setEmergencyContact(e.target.value)}
            />
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

          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Medical Condition
            </label>
            <textarea
              rows={3}
              className="border rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-red-400"
              value={medicalCondition}
              onChange={(e) => setMedicalCondition(e.target.value)}
            ></textarea>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Allergies
            </label>
            <textarea
              rows={2}
              placeholder="List any allergies (medications, food, etc.)"
              className="border rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-red-400"
              value={allergies}
              onChange={(e) => setAllergies(e.target.value)}
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
