import { useEffect, useState } from 'react';
import { hospitalAPI } from '../services/hospitalAPI';
import type { ApprovalRequest } from '../services/hospitalAPI';
import { useAuth } from '../../../context/AuthContext';

export default function Approvals() {
  const { user } = useAuth();
  const reviewerId = user?.id || 0;

  const [requests, setRequests] = useState<ApprovalRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await hospitalAPI.getApprovalRequests();
      setRequests(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const review = async (id: number, status: string) => {
    if (!confirm(`Set status to ${status}?`)) return;
    try {
      await hospitalAPI.updateApprovalRequest(id, status, reviewerId);
      load();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Approval Requests</h2>
      <div className="bg-white rounded shadow overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Request</th>
              <th className="p-3">Type</th>
              <th className="p-3">Created</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="p-4">Loading...</td></tr>
            ) : requests.length === 0 ? (
              <tr><td colSpan={6} className="p-4">No requests</td></tr>
            ) : (
              requests.map(r => (
                <tr key={r.id} className="border-t">
                  <td className="p-3">{r.userName}</td>
                  <td className="p-3">{r.userEmail}</td>
                  <td className="p-3">{r.requestType}{r.bloodType ? ` (${r.bloodType})` : ''}</td>
                  <td className="p-3">{r.status}</td>
                  <td className="p-3">{new Date(r.createdAt).toLocaleString()}</td>
                  <td className="p-3">
                    <button className="mr-2 text-green-600" onClick={() => review(r.id, 'approved')}>Approve</button>
                    <button className="text-red-600" onClick={() => review(r.id, 'rejected')}>Reject</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
