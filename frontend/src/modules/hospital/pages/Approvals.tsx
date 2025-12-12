import { useEffect, useState } from 'react';
import { Search, X, ChevronDown, ChevronUp } from 'lucide-react';
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
  const [expandedNotes, setExpandedNotes] = useState<Set<number>>(new Set());

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

  const toggleNoteExpansion = (requestId: number) => {
    const newExpanded = new Set(expandedNotes);
    if (newExpanded.has(requestId)) {
      newExpanded.delete(requestId);
    } else {
      newExpanded.add(requestId);
    }
    setExpandedNotes(newExpanded);
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
    <div className="p-6 bg-gradient-to-br from-red-50 via-white to-red-50 min-h-screen">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Approval Requests</h2>
        <p className="text-gray-600">Review and manage blood request approvals</p>
      </div>
      
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
      
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gradient-to-r from-red-600 to-red-700 text-white">
            <tr>
              <th className="p-4 font-semibold">Name</th>
              <th className="p-4 font-semibold bg-red-500 bg-opacity-20">Email</th>
              <th className="p-4 font-semibold">Request</th>
              <th className="p-4 font-semibold bg-red-500 bg-opacity-20">Status</th>
              <th className="p-4 font-semibold">Doctor Note</th>
              <th className="p-4 font-semibold bg-red-500 bg-opacity-20">Created</th>
              <th className="p-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="p-4">Loading...</td></tr>
            ) : filteredRequests.length === 0 ? (
              <tr><td colSpan={7} className="p-4">{searchTerm ? 'No matching requests found' : 'No requests'}</td></tr>
            ) : (
              filteredRequests.map((r, index) => (
                <tr key={r.id} className={`border-t border-gray-100 hover:bg-red-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                  <td className="p-4 font-medium text-gray-900">{r.userName}</td>
                  <td className="p-4 text-gray-600 bg-red-50 bg-opacity-30">{r.userEmail}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-900">{r.requestType}</span>
                      {r.bloodType && (
                        <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                          {r.bloodType}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 bg-red-50 bg-opacity-30">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      r.status.toLowerCase() === 'approved' ? 'bg-green-100 text-green-700' :
                      r.status.toLowerCase() === 'rejected' ? 'bg-red-100 text-red-700' :
                      r.status.toLowerCase() === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="p-4 max-w-xs">
                    {r.doctorNote && r.doctorNote.length > 50 ? (
                      <div>
                        <div className={expandedNotes.has(r.id) ? '' : 'truncate'}>
                          {expandedNotes.has(r.id) ? r.doctorNote : `${r.doctorNote.substring(0, 50)}...`}
                        </div>
                        <button
                          onClick={() => toggleNoteExpansion(r.id)}
                          className="text-red-600 hover:text-red-800 text-sm flex items-center gap-1 mt-1 transition-colors"
                        >
                          {expandedNotes.has(r.id) ? (
                            <><ChevronUp className="w-3 h-3" /> Show less</>
                          ) : (
                            <><ChevronDown className="w-3 h-3" /> Show more</>
                          )}
                        </button>
                      </div>
                    ) : (
                      <div className="text-gray-600">{r.doctorNote || 'No note'}</div>
                    )}
                  </td>
                  <td className="p-4 text-gray-600 bg-red-50 bg-opacity-30">
                    <div className="text-sm">
                      {new Date(r.createdAt).toLocaleDateString()}
                      <div className="text-xs text-gray-500">
                        {new Date(r.createdAt).toLocaleTimeString()}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button 
                        className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium" 
                        onClick={() => review(r.id, 'approved')}
                      >
                        Approve
                      </button>
                      <button 
                        className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium" 
                        onClick={() => review(r.id, 'rejected')}
                      >
                        Reject
                      </button>
                    </div>
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
