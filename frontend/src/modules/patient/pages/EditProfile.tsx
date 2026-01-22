import { useState, useEffect } from "react"; 
// Used to store form data and run code when the page loads

import { useAuth } from "../../../context/AuthContext";
// Used to know which patient is currently logged in

import { patientAPI } from '../../../api';
// Used to get and update patient data from the backend

import { useNavigate } from "react-router-dom";
// Used to move the user to another page after saving

export default function EditProfile() {

  // Get the logged-in patient details
  const { user } = useAuth();

  // Used to redirect the user after profile is saved
  const navigate = useNavigate();

  // Used to show loading message while fetching data
  const [loading, setLoading] = useState(true);

  // These store the values typed into the form fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [bloodTypeNeeded, setBloodTypeNeeded] = useState("");
  const [medicalCondition, setMedicalCondition] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [address, setAddress] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [allergies, setAllergies] = useState("");

  // Used to show success message after saving
  const [saved, setSaved] = useState(false);

  // Used to show error messages
  const [error, setError] = useState("");

  // This runs automatically when the page opens
  useEffect(() => {

    // Function to load the patient's existing profile
    const loadProfile = async () => {

      // Stop if user is not logged in yet
      if (!user?.id) return;

      try {
        // Get patient profile from backend
        const result = await patientAPI.getProfile(user.id);

        // If successful, fill the form with existing data
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
        // Show error if profile fails to load
        setError("Failed to load profile");

      } finally {
        // Stop showing loading message
        setLoading(false);
      }
    };

    // Call the function when page loads
    loadProfile();

  }, [user]); // Runs again if logged-in user changes

  // This runs when the user clicks "Save Changes"
  const handleSave = async (e: React.FormEvent) => {

    // Prevent page refresh
    e.preventDefault();

    // Stop if user ID is missing
    if (!user?.id) return;

    try {
      // Send updated data to backend
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
        // Show success message
        setSaved(true);

        // Redirect to profile page after 2 seconds
        setTimeout(() => navigate("/patient/profile"), 2000);
      } else {
        // Show backend error message
        setError(result.message || "Failed to update profile");
      }

    } catch (err) {
      // Show error if save fails
      setError("Error updating profile");
    }
  };

  // While data is loading, show loading text
  if (loading) return <div className="p-6">Loading...</div>;


  //Tailwind CSS for the page layout and styling
  return (
    <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-md space-y-6 border border-gray-200">

     
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Edit Profile</h1> 
        <p className="text-gray-600 mt-1">
          Update your personal and medical information below.
        </p>
      </div>

     
      {saved && (
        <div className="p-4 bg-green-50 border border-green-300 text-green-700 rounded-lg">
          ✔ Profile updated successfully!
        </div>
      )}

     
      {error && (
        <div className="p-4 bg-red-50 border border-red-300 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Form starts here */}
      <form onSubmit={handleSave} className="space-y-6">

        {/* All inputs are connected to state (what user types is stored) */}

      
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
