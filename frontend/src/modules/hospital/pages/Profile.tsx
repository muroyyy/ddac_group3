import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';

interface HospitalProfile {
  hospitalName: string;
  address: string;
  contactPerson: string;
  contactNumber: string;
  email: string;
  fullName: string;
  phone: string;
}

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<HospitalProfile>({
    hospitalName: '',
    address: '',
    contactPerson: '',
    contactNumber: '',
    email: user?.email || '',
    fullName: user?.name || '',
    phone: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user?.id) {
        try {
          const response = await fetch(`https://bloodline.dev/api/hospital/profile?userId=${user.id}`);
          if (response.ok) {
            const hospitalData = await response.json();
            setProfile(prev => ({
              ...prev,
              hospitalName: hospitalData.hospital_name || '',
              // Add other hospital fields when backend provides them
            }));
          }
        } catch (e) {
          console.error('Failed to fetch hospital profile:', e);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchProfile();
  }, [user?.id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Update user profile
      const userResponse = await fetch(`https://bloodline.dev/api/auth/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: profile.fullName,
          email: profile.email,
          phone: profile.phone
        })
      });

      // Update hospital profile
      const hospitalResponse = await fetch(`https://bloodline.dev/api/hospital/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          hospitalName: profile.hospitalName,
          address: profile.address,
          contactPerson: profile.contactPerson,
          contactNumber: profile.contactNumber
        })
      });

      if (userResponse.ok && hospitalResponse.ok) {
        alert('Profile updated successfully!');
      } else {
        alert('Failed to update profile');
      }
    } catch (e) {
      console.error('Error updating profile:', e);
      alert('Error updating profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Hospital Profile Settings</h2>
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="space-y-6">
          {/* User Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-800">User Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                  value={profile.fullName}
                  onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Hospital Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Hospital Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Hospital Name</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                  value={profile.hospitalName}
                  onChange={(e) => setProfile({ ...profile, hospitalName: e.target.value })}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <textarea
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                  rows={3}
                  value={profile.address}
                  onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contact Person</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                  value={profile.contactPerson}
                  onChange={(e) => setProfile({ ...profile, contactPerson: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number</label>
                <input
                  type="tel"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                  value={profile.contactNumber}
                  onChange={(e) => setProfile({ ...profile, contactNumber: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}