
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

export default function LogoutConfirm() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const confirm = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="max-w-md mx-auto mt-20">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Confirm Logout</h2>
        <p className="text-sm text-gray-600 mb-6">Are you sure you want to log out?</p>
        <div className="flex gap-3">
          <button onClick={confirm} className="flex-1 bg-red-600 text-white py-2 rounded">Logout</button>
          <button onClick={() => navigate(-1)} className="flex-1 bg-gray-100 py-2 rounded">Cancel</button>
        </div>
      </div>
    </div>
  );
}
