import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { patientAPI } from '../services/patientAPI';
import type { PatientProfile } from '../services/patientAPI';

export default function Profile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) loadProfile();
  }, [user]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await patientAPI.getPatientProfile(user!.id);
      setProfile(data);
    } catch (err) {
      console.error('Error loading patient profile:', err);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-6">Loading profile...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Patient Profile</h1>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <div className="text-gray-900">{profile?.fullName}</div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div className="text-gray-900">{profile?.email}</div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <div className="text-gray-900">{profile?.phone || '-'}</div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Blood Type</label>
            <div className="text-gray-900">{profile?.bloodType || 'N/A'}</div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <div className="text-gray-900">{profile?.location || '-'}</div>
          </div>

          <div className="pt-4">
            <button
              onClick={() => window.location.assign('/patient/edit-profile')}
              className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition"
            >
              Edit Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
