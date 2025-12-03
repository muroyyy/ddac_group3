import { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { patientAPI } from '../services/patientAPI';

export default function RequestBlood() {
  const { user } = useAuth();
  const [form, setForm] = useState({ bloodType: '', units: 1, notes: '' });
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    setLoading(true);
    try {
      const res = await patientAPI.createBloodRequest(user.id, { bloodType: form.bloodType, unitsRequested: form.units, notes: form.notes } as any);
      alert(res.message);
      window.location.assign('/patient/requests');
    } catch (err) {
      console.error('Error creating request:', err);
      alert('Failed to create request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-4">Request Blood</h1>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Blood Type</label>
            <input value={form.bloodType} onChange={(e) => setForm({ ...form, bloodType: e.target.value })} className="w-full border px-3 py-2 rounded" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Units</label>
            <input type="number" min={1} value={form.units} onChange={(e) => setForm({ ...form, units: Number(e.target.value) })} className="w-full border px-3 py-2 rounded" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full border px-3 py-2 rounded" />
          </div>
          <div>
            <button className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition" disabled={loading}>{loading ? 'Requesting...' : 'Submit Request'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
