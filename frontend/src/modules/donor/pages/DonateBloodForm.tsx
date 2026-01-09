import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { donorAPI } from '../services/donorAPI';

export default function DonateBloodForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [selectedHospital, setSelectedHospital] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    bloodType: '',
    unitsRequested: 1,
    notes: '',
  });

  useEffect(() => {
    if (user?.id) {
      loadProfile();
      loadHospitals();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      const data = await donorAPI.getProfile(user!.id);
      setProfile(data);
      setFormData(prev => ({ ...prev, bloodType: data.bloodType }));
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const loadHospitals = async () => {
    try {
      console.log('Loading hospitals...');
      const data = await donorAPI.getHospitals();
      console.log('Hospitals loaded:', data);
      setHospitals(data);
    } catch (error) {
      console.error('Error loading hospitals:', error);
      // Fallback to mock data if API fails
      setHospitals([
        { id: 1, name: 'City General Hospital', location: '123 Medical Drive, Kuala Lumpur', phone: '03-12345678' },
        { id: 2, name: 'Kuala Lumpur Medical Centre', location: '456 Jalan Ampang, Kuala Lumpur', phone: '03-22889900' },
        { id: 3, name: 'Penang Specialist Hospital', location: '22 Jalan Tun Dr Lim Chong Eu, Penang', phone: '04-2233445' }
      ]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile?.bloodType) {
      alert('Please complete your profile first');
      navigate('/donor/profile');
      return;
    }

    if (!selectedHospital) {
      alert('Please select a hospital');
      return;
    }

    setLoading(true);
    try {
      const requestData = {
        ...formData,
        hospitalId: selectedHospital
      };
      const result = await donorAPI.createDonationRequest(user!.id, requestData);
      if (result.message) {
        alert(result.message);
        navigate('/donor/dashboard');
      }
    } catch (error) {
      console.error('Error submitting request:', error);
      alert('Failed to submit donation request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Request to Donate Blood</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Blood Type
            </label>
            <input
              type="text"
              value={profile?.bloodType || 'Loading...'}
              readOnly
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed"
            />
            <p className="text-sm text-gray-500 mt-1">Blood type from your profile</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Units to Donate
            </label>
            <input
              type="number"
              min="1"
              max="5"
              value={formData.unitsRequested}
              onChange={(e) => setFormData({ ...formData, unitsRequested: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              required
            />
            <p className="text-sm text-gray-500 mt-1">Typically 1 unit = 450ml</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Hospital *
            </label>
            <div className="border border-gray-300 rounded-lg max-h-48 overflow-y-auto">
              {hospitals.map((hospital) => (
                <div
                  key={hospital.id}
                  onClick={() => setSelectedHospital(hospital.id)}
                  className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${
                    selectedHospital === hospital.id ? 'bg-red-50 border-red-200' : ''
                  }`}
                >
                  <div className="flex items-center">
                    <input
                      type="radio"
                      name="hospital"
                      checked={selectedHospital === hospital.id}
                      onChange={() => setSelectedHospital(hospital.id)}
                      className="mr-3 text-red-600"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{hospital.name}</h3>
                      <p className="text-sm text-gray-600">{hospital.location}</p>
                      <p className="text-sm text-gray-500">{hospital.phone}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {hospitals.length === 0 && (
              <p className="text-sm text-gray-500 mt-2">Loading hospitals...</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Any special notes or preferences..."
            />
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
            <p className="text-sm text-blue-700">
              <strong>Note:</strong> Your donation request will be sent to nearby hospitals. They will contact you to schedule an appointment.
            </p>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition disabled:bg-gray-400"
            >
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/donor/dashboard')}
              className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
