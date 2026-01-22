/**
 * REQUEST BLOOD PAGE - FRONTEND COMPONENT
 * 
 * This React component allows patients to submit blood requests to hospitals.
 * 
 * BUSINESS LOGIC:
 * 1. Patient fills out blood request form
 * 2. System validates patient profile has blood type set
 * 3. Request is submitted to backend
 * 4. Hospital staff will review and approve/reject
 * 5. If approved, appointment is automatically created
 * 
 * SECURITY:
 * - Only authenticated patients can access this page
 * - User session validation on form submission
 * - Backend validates all data before saving
 */

// React hooks for component state and lifecycle management
import { useState, useEffect } from "react";
// API service for patient-related backend calls
import { patientAPI } from '../../../api';
// Authentication context to get current logged-in user
import { useAuth } from "../../../context/AuthContext";
// Navigation hook for redirecting users
import { useNavigate } from "react-router-dom";
// Lucide icon for edit button
import { Edit } from "lucide-react";

/**
 * RequestBlood Component
 * 
 * COMPONENT ARCHITECTURE:
 * - Form-based interface for blood request submission
 * - Auto-loads patient's blood type from profile
 * - Validates required fields before submission
 * - Provides user feedback on success/failure
 * - Redirects unauthorized users
 */
export default function RequestBlood() {
  // Get authenticated user from context
  const { user } = useAuth();
  // Navigation function for redirects
  const navigate = useNavigate();

  /**
   * SECURITY CHECK - Ensure only patients can access this page
   * Runs when component mounts or user changes
   */
  useEffect(() => {
    if (!user || user.role !== "patient") {
      alert("Only patients can access this page.");
      navigate("/login");
      return;
    }
  }, [user, navigate]);

  // FORM STATE MANAGEMENT - All form input values
  const [bloodType, setBloodType] = useState("");        // Auto-loaded from patient profile
  const [units, setUnits] = useState("");                // Number of blood units needed
  const [urgency, setUrgency] = useState("");            // Urgency level (Low/Medium/High/Critical)
  const [hospital, setHospital] = useState("");          // Selected hospital ID
  const [notes, setNotes] = useState("");                // Optional additional notes
  const [hospitals, setHospitals] = useState([]);         // Real hospitals from database
  
  // UI STATE MANAGEMENT
  const [submitted, setSubmitted] = useState(false);      // Success message visibility
  const [loading, setLoading] = useState(true);          // Loading state for profile fetch

  /**
   * PROFILE LOADING - Auto-populate blood type from patient profile
   * 
   * FLOW:
   * 1. Component mounts
   * 2. Calls backend to get patient profile
   * 3. Extracts blood type and pre-fills form
   * 4. If no blood type set, shows warning message
   */
  useEffect(() => {
    const loadData = async () => {
      // Security check - ensure user is authenticated
      if (!user?.id) return;
      
      try {
        // Load patient profile and hospitals in parallel
        const [profileResult, hospitalsResult] = await Promise.all([
          patientAPI.getProfile(user.id),
          patientAPI.getHospitals()
        ]);
        
        // Set blood type from profile
        if (profileResult.success && profileResult.data.bloodTypeNeeded) {
          setBloodType(profileResult.data.bloodTypeNeeded);
        }
        
        // Set hospitals list
        if (hospitalsResult.success) {
          setHospitals(hospitalsResult.data);
        }
      } catch (error) {
        // ERROR HANDLING - Log but don't crash the form
        console.error("Failed to load data:", error);
      } finally {
        // Always clear loading state
        setLoading(false);
      }
    };
    
    loadData();
  }, [user]);



  /**
   * FORM SUBMISSION HANDLER
   * 
   * FLOW:
   * 1. Prevent default form submission
   * 2. Validate user session
   * 3. Prepare request payload
   * 4. Call backend API
   * 5. Handle success/error responses
   * 6. Show user feedback
   */
  const handleSubmit = async (e: React.FormEvent) => {
    // Prevent default HTML form submission
    e.preventDefault();

    // SECURITY VALIDATION - Ensure user is still authenticated
    if (!user?.id) {
      alert("User session missing. Please relogin.");
      navigate("/login");
      return;
    }

    // PREPARE API PAYLOAD - Format data for backend
    const payload = {
      bloodType,                          // Patient's blood type
      unitsRequired: Number(units),       // Convert string to number
      urgencyLevel: urgency,              // Urgency level
      hospitalId: Number(hospital),       // Convert hospital ID to number
      notes,                              // Optional notes
    };

    try {
      // API CALL - Submit blood request to backend
      const response = await patientAPI.createBloodRequest(user.id, payload);

      if (response.success) {
        // SUCCESS - Show success message
        setSubmitted(true);
      } else {
        // BACKEND ERROR - Show error message from server
        alert(response.message || "Something went wrong.");
      }
    } catch (error) {
      // NETWORK ERROR - Handle API call failures
      console.error("API error:", error);
      alert("Failed to submit blood request.");
    }
  };

  // LOADING STATE - Show loading message while fetching profile
  if (loading) return <div className="p-6">Loading...</div>;

  /**
   * RENDER COMPONENT JSX
   * 
   * STRUCTURE:
   * 1. Page header
   * 2. Success message (if submitted)
   * 3. Blood request form with validation
   * 4. Form fields with proper labeling
   * 5. Submit button with validation
   */
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* PAGE HEADER */}
      <h1 className="text-3xl font-bold">Request Blood</h1>

      {/* SUCCESS MESSAGE - Only shown after successful submission */}
      {submitted && (
        <div className="bg-green-50 p-4 border border-green-300 rounded-lg">
          <strong>✔ Request submitted successfully!</strong>
        </div>
      )}

      {/* BLOOD REQUEST FORM */}
      <form
        onSubmit={handleSubmit}  // Form submission handler
        className="bg-white p-8 rounded-xl shadow-md border space-y-6"
      >
        <h2 className="text-xl font-semibold">Blood Request Details</h2>

        {/* BLOOD TYPE FIELD - Read-only with edit option */}
        <div>
          <label className="block mb-1">Blood Type</label>
          <div className="flex items-center gap-3">
            {/* READ-ONLY INPUT - Shows blood type from profile */}
            <input
              type="text"
              value={bloodType || "Not set in profile"}  // Show message if no blood type
              readOnly  // Prevents direct editing
              className="border rounded-lg p-2 flex-1 bg-gray-50 cursor-not-allowed"
            />
            {/* EDIT BUTTON - Redirects to profile page */}
            <button
              type="button"
              onClick={() => navigate('/patient/profile')}  // Navigate to profile page
              className="flex items-center gap-2 px-3 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 cursor-pointer"
            >
              <Edit className="w-4 h-4" />
              Edit in Profile
            </button>
          </div>
          {/* WARNING MESSAGE - Shows if blood type not set */}
          {!bloodType && (
            <p className="text-red-600 text-sm mt-1">
              Please set your blood type in your profile first.
            </p>
          )}
        </div>

        {/* UNITS REQUIRED FIELD */}
        <div>
          <label className="block mb-1">Units Required</label>
          <input
            type="number"
            min="1"  // Minimum 1 unit
            value={units}
            onChange={(e) => setUnits(e.target.value)}  // Update state on change
            required  // HTML5 validation
            className="border rounded-lg p-2 w-full"
          />
        </div>

        {/* URGENCY LEVEL FIELD */}
        <div>
          <label className="block mb-1">Urgency</label>
          <select
            value={urgency}
            onChange={(e) => setUrgency(e.target.value)}  // Update state on change
            required  // HTML5 validation
            className="border rounded-lg p-2 w-full"
          >
            <option value="">Select urgency</option>
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
            <option>Critical</option>
          </select>
        </div>

        {/* HOSPITAL SELECTION FIELD */}
        <div>
          <label className="block mb-1">Hospital</label>
          <select
            value={hospital}
            onChange={(e) => setHospital(e.target.value)}  // Update state on change
            required  // HTML5 validation
            className="border rounded-lg p-2 w-full"
          >
            <option value="">Select hospital</option>
            {/* DYNAMIC OPTIONS - Map through real hospital list */}
            {hospitals.map((h) => (
              <option key={h.hospitalId} value={h.hospitalId}>
                {h.hospitalName}
              </option>
            ))}
          </select>
        </div>

        {/* OPTIONAL NOTES FIELD */}
        <div>
          <label className="block mb-1">Notes (Optional)</label>
          <textarea
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}  // Update state on change
            className="border rounded-lg p-2 w-full"
          />
        </div>

        {/* SUBMIT BUTTON - Disabled if blood type not set */}
        <button
          type="submit"
          disabled={!bloodType}  // Disable if no blood type
          className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer"
        >
          Submit Request
        </button>
      </form>
    </div>
  );
}
