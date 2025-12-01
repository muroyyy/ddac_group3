import { useNavigate } from 'react-router-dom';

export default function Unauthorized() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded shadow text-center">
        <h1 className="text-2xl font-bold mb-4">Unauthorized</h1>
        <p className="mb-6">You do not have permission to view this page.</p>
        <div className="flex justify-center">
          <button onClick={() => navigate('/')} className="px-4 py-2 bg-blue-600 text-white rounded">Go to Home</button>
        </div>
      </div>
    </div>
  );
}
