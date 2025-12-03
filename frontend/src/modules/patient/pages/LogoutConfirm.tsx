import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";

// This page appears when a user clicks "Logout".
// Instead of logging out immediately, we show a confirmation screen.
// This prevents accidental logout.

export default function LogoutConfirm() {
  const navigate = useNavigate();

  // Access the logout function from AuthContext
  const { logout } = useAuth();

  // Called when the user presses the final "Logout" button
  const handleLogout = () => {
    logout();          // Clear user session
    navigate("/login"); // Redirect to login page
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">

      {/* The confirmation card box */}
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md text-center">

        {/* Title */}
        <h1 className="text-2xl font-bold text-red-600">Logout</h1>

        {/* Message */}
        <p className="text-gray-700 mt-3">
          Are you sure you want to log out from your account?
        </p>

        {/* Buttons */}
        <div className="flex gap-4 justify-center mt-6">

          {/* CANCEL BUTTON */}
          {/* Takes user back to dashboard WITHOUT logging out */}
          <button
            onClick={() => navigate(-1)} 
            className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg transition"
          >
            Cancel
          </button>

          {/* LOGOUT BUTTON */}
          {/* Actually logs the user out */}
          <button
            onClick={handleLogout}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
          >
            Logout
          </button>

        </div>
      </div>
    </div>
  );
}
