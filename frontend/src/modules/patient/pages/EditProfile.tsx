import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { patientAPI } from '../services/patientAPI';

export default function EditProfile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ fullName: '', phone: '', bloodType: '', location: '' });

  useEffect(() => {
    if (user?.id) loadProfile();
  }, [user]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const data = await patientAPI.getPatientProfile(user!.id);
      setFormData({
        fullName: data.fullName || '',
        phone: data.phone || '',
        bloodType: data.bloodType || '',
        location: data.location || '',
      });
    } catch (err) {
      console.error('Error loading profile for edit:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await patientAPI.updatePatientProfile(user!.id, formData as any);
      alert('Profile updated (mock)');
      window.location.assign('/patient/profile');
    } catch (err) {
      console.error('Error updating profile:', err);
      alert('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Profile</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input className="w-full border px-3 py-2 rounded" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input className="w-full border px-3 py-2 rounded" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Blood Type</label>
            <input className="w-full border px-3 py-2 rounded" value={formData.bloodType} onChange={(e) => setFormData({ ...formData, bloodType: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input className="w-full border px-3 py-2 rounded" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
          </div>

          <div>
            <button disabled={loading} className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition">{loading ? 'Saving...' : 'Save Changes'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
