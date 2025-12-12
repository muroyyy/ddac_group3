import { useEffect, useState } from 'react';
import { Search, X } from 'lucide-react';
import { hospitalAPI } from '../services/hospitalAPI';
import type { ApprovalRequest } from '../services/hospitalAPI';
import { useAuth } from '../../../context/AuthContext';

export default function Approvals() {
  const { user } = useAuth();
  const reviewerId = user?.id || 0;

  const [requests, setRequests] = useState<ApprovalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [bloodTypeFilter, setBloodTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

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

  const clearFilters = () => {
    setSearchTerm('');
    setBloodTypeFilter('');
    setStatusFilter('');
    setSortOrder('newest');
  };

  const filteredRequests = requests
    .filter(request => {
      const matchesName = request.userName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesBloodType = !bloodTypeFilter || request.bloodType === bloodTypeFilter;
      const matchesStatus = !statusFilter || request.status.toLowerCase() === statusFilter.toLowerCase();
      return matchesName && matchesBloodType && matchesStatus;
    })
    .sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

  const bloodTypes = [...new Set(requests.map(r => r.bloodType).filter(Boolean))];
  const statuses = [...new Set(requests.map(r => r.status))];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Approval Requests</h2>
      
      {/* Search and Filters */}
      <div className="mb-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-red-500 focus:border-red-500"
          />
        </div>
        
        {/* Blood Type Filter */}
        <select
          value={bloodTypeFilter}
          onChange={(e) => setBloodTypeFilter(e.target.value)}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
        >
          <option value="">All Blood Types</option>
          {bloodTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
        
        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
        >
          <option value="">All Statuses</option>
          {statuses.map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
        
        {/* Date Sort */}
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>
        </div>
        
        {/* Clear Filters Button */}
        <div className="flex justify-end">
          <button
            onClick={clearFilters}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
          >
            <X className="h-4 w-4" />
            Clear Filters
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded shadow overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Request</th>
              <th className="p-3">Type</th>
              <th className="p-3">Doctor Note</th>
              <th className="p-3">Created</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="p-4">Loading...</td></tr>
            ) : filteredRequests.length === 0 ? (
              <tr><td colSpan={7} className="p-4">{searchTerm ? 'No matching requests found' : 'No requests'}</td></tr>
            ) : (
              filteredRequests.map(r => (
                <tr key={r.id} className="border-t">
                  <td className="p-3">{r.userName}</td>
                  <td className="p-3">{r.userEmail}</td>
                  <td className="p-3">{r.requestType}{r.bloodType ? ` (${r.bloodType})` : ''}</td>
                  <td className="p-3">{r.status}</td>
                  <td className="p-3 max-w-xs">
                    <div className="truncate" title={r.doctorNote || 'No note'}>
                      {r.doctorNote || 'No note'}
                    </div>
                  </td>
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
