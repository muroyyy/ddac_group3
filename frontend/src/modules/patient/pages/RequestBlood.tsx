import { useState, useEffect } from "react";
// Used to store form values and run code when the page loads

import { patientAPI } from '../../../api';
// Used to send and fetch data from the backend

import { useAuth } from "../../../context/AuthContext";
// Used to know who is logged in

import { useNavigate } from "react-router-dom";
// Used to move user to another page

import { Edit } from "lucide-react";
// Icon used for the “Edit in Profile” button


export default function RequestBlood() {

  // Get the logged-in user
  const { user } = useAuth();

  // Used to redirect user
  const navigate = useNavigate();


  // SECURITY CHECK
  // This runs when the page loads
  // If the user is NOT a patient, block access
  useEffect(() => {
    if (!user || user.role !== "patient") {
      alert("Only patients can access this page.");
      navigate("/login");
      return;
    }
  }, [user, navigate]);


  // FORM INPUT STATES
  // Each variable stores what the user types or selects
  const [bloodType, setBloodType] = useState("");
  const [units, setUnits] = useState("");
  const [urgency, setUrgency] = useState("");
  const [hospital, setHospital] = useState("");
  const [notes, setNotes] = useState("");

  // Stores list of hospitals from backend
  const [hospitals, setHospitals] = useState<any[]>([]);

  // Used to show success message after submission
  const [submitted, setSubmitted] = useState(false);

  // Used to show loading state
  const [loading, setLoading] = useState(true);


  // LOAD DATA WHEN PAGE OPENS
  // Fetch patient profile and hospital list
  useEffect(() => {

    const loadData = async () => {

      // Stop if user is not ready
      if (!user?.id) return;

      try {
        // Fetch profile and hospitals at the same time
        const [profileResult, hospitalsResult] = await Promise.all([
          patientAPI.getProfile(user.id),
          patientAPI.getHospitals()
        ]);

        // If patient already has blood type in profile, auto-fill it
        if (profileResult.success && profileResult.data.bloodTypeNeeded) {
          setBloodType(profileResult.data.bloodTypeNeeded);
        }

        // Store hospital list for dropdown
        if (hospitalsResult.success) {
          setHospitals(hospitalsResult.data);
        }

      } catch (error) {
        // Log error if data fails to load
        console.error("Failed to load data:", error);

      } finally {
        // Stop loading screen
        setLoading(false);
      }
    };

    // Call the function when page loads
    loadData();

  }, [user]);


  // RUNS WHEN USER CLICKS "SUBMIT REQUEST"
  const handleSubmit = async (e: React.FormEvent) => {

    // Stop page refresh
    e.preventDefault();

    // If user session is missing, redirect to login
    if (!user?.id) {
      alert("User session missing. Please relogin.");
      navigate("/login");
      return;
    }

    // Prepare data to send to backend
    const payload = {
      bloodType,
      unitsRequired: Number(units),
      urgencyLevel: urgency,
      hospitalId: Number(hospital),
      notes,
    };

    try {
      // Send blood request to backend
      const response = await patientAPI.createBloodRequest(user.id, payload);

      if (response.success) {
        // Show success message
        setSubmitted(true);
      } else {
        // Show backend error
        alert(response.message || "Something went wrong.");
      }

    } catch (error) {
      // Handle API error
      console.error("API error:", error);
      alert("Failed to submit blood request.");
    }
  };


  // SHOW LOADING SCREEN WHILE DATA IS FETCHING
  if (loading) return <div className="p-6">Loading...</div>;


  return (
    <div className="max-w-3xl mx-auto space-y-6">

      {/* PAGE TITLE */}
      <h1 className="text-3xl font-bold">Request Blood</h1>

      {/* SUCCESS MESSAGE */}
      {submitted && (
        <div className="bg-green-50 p-4 border border-green-300 rounded-lg">
          ✔ Request submitted successfully!
        </div>
      )}

      {/* FORM STARTS HERE */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-md border space-y-6"
      >

        <h2 className="text-xl font-semibold">Blood Request Details</h2>

        {/* BLOOD TYPE FIELD (READ-ONLY) */}
        <div>
          <label>Blood Type</label>

          <div className="flex items-center gap-3">
            <input
              type="text"
              value={bloodType || "Not set in profile"}
              readOnly
            />

            {/* BUTTON TO EDIT PROFILE */}
            <button
              type="button"
              onClick={() => navigate('/patient/profile')}
            >
              <Edit className="w-4 h-4" />
              Edit in Profile
            </button>
          </div>

          {/* WARNING IF BLOOD TYPE IS NOT SET */}
          {!bloodType && (
            <p className="text-red-600 text-sm">
              Please set your blood type in your profile first.
            </p>
          )}
        </div>

        {/* UNITS REQUIRED */}
        <div>
          <label>Units Required</label>
          <input
            type="number"
            min="1"
            value={units}
            onChange={(e) => setUnits(e.target.value)}
            required
          />
        </div>

        {/* URGENCY LEVEL */}
        <div>
          <label>Urgency</label>
          <select
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

        {/* HOSPITAL SELECTION */}
        <div>
          <label>Hospital</label>
          <select
            value={hospital}
            onChange={(e) => setHospital(e.target.value)}
            required
          >
            <option value="">Select hospital</option>
            {hospitals.map((h) => (
              <option key={h.hospitalId} value={h.hospitalId}>
                {h.hospitalName}
              </option>
            ))}
          </select>
        </div>

        {/* OPTIONAL NOTES */}
        <div>
          <label>Notes (Optional)</label>
          <textarea
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {/* SUBMIT BUTTON */}
        <button
          type="submit"
          disabled={!bloodType}
        >
          Submit Request
        </button>

      </form>
    </div>
  );
}
