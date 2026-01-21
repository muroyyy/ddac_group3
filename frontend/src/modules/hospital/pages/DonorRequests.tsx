import { useEffect, useState } from 'react';
import { Search, Heart, Calendar, User, AlertCircle, ArrowUpDown } from 'lucide-react';
import { hospitalAPI } from '../services/hospitalAPI';
import { useAuth } from '../../../context/AuthContext';

interface DonorRequest {
  donationId: number;
  donorId: number;
  donorName: string;
  donorEmail: string;
  donorPhone: string;
  bloodType: string;
  unitsRequested: number;
  status: string;
  notes: string;
  requestedDate: string;
}

export default function DonorRequests() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<DonorRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [bloodTypeFilter, setBloodTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedRequest, setSelectedRequest] = useState<DonorRequest | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvingRequest, setApprovingRequest] = useState<DonorRequest | null>(null);
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');

  const loadRequests = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const requestsRes = await hospitalAPI.getDonorRequests(user.id);
      
      if (requestsRes.success) {
        setRequests(requestsRes.data || []);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const showApprovalDialog = (request: DonorRequest) => {
    setApprovingRequest(request);
    setAppointmentDate('');
    setAppointmentTime('');
    setShowApprovalModal(true);
  };

  const approveRequest = async () => {
    if (!approvingRequest || !appointmentDate || !appointmentTime) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const appointmentDateTime = new Date(`${appointmentDate}T${appointmentTime}`);
      const result = await hospitalAPI.approveDonorRequest(approvingRequest.donationId, {
        doctorId: 1, // Default doctor ID
        appointmentDate: appointmentDateTime
      });
      
      if (result.success) {
        setShowApprovalModal(false);
        setApprovingRequest(null);
        // Reload the requests list to remove the approved request
        await loadRequests();
        alert('Donation request approved and appointment created successfully!');
      } else {
        alert('Failed to approve request');
      }
    } catch (error) {
      console.error('Failed to approve request:', error);
      alert('Failed to approve request');
    }
  };

  const showRejectDialog = (id: number) => {
    setRejectingId(id);
    setRejectionReason('');
    setShowRejectModal(true);
  };

  const rejectRequest = async () => {
    if (!rejectingId) return;
    try {
      const result = await hospitalAPI.rejectDonorRequest(rejectingId, rejectionReason);
      if (result.success) {
        setShowRejectModal(false);
        setRejectingId(null);
        setRejectionReason('');
        // Reload the requests list to remove the rejected request
        await loadRequests();
        alert('Donation request rejected successfully. Donor has been notified.');
      } else {
        alert('Failed to reject request');
      }
    } catch (error) {
      console.error('Failed to reject request:', error);
      alert('Failed to reject request');
    }
  };

  const filteredRequests = requests
    .filter(request => 
      (!searchTerm || request.donorName.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (!bloodTypeFilter || request.bloodType === bloodTypeFilter) &&
      (!statusFilter || request.status.toLowerCase() === statusFilter.toLowerCase())
    )
    .sort((a, b) => {
      const dateA = new Date(a.requestedDate).getTime();
      const dateB = new Date(b.requestedDate).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

  // Get unique blood types for filter
  const uniqueBloodTypes = [...new Set(requests.map(req => req.bloodType))].sort();

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-red-50">
      <div className="space-y-8 ml-6 mr-6 py-8">
        {/* Enhanced page header */}
        <div className="bg-gradient-to-r from-pink-500 to-red-600 rounded-3xl p-8 text-white shadow-2xl">
          <h1 className="text-4xl font-bold flex items-center gap-3 mb-2">
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
              <Heart className="w-8 h-8" />
            </div>
            Donor Requests
          </h1>
          <p className="text-pink-100 text-lg">
            Review and manage blood donation requests from donors
          </p>
        </div>

        {/* Enhanced search controls */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/50">
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[300px]">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-pink-400" />
              <input
                type="text"
                placeholder="Search by donor name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border-2 border-pink-200 rounded-2xl focus:ring-4 focus:ring-pink-500/20 focus:border-pink-500 transition-all duration-300 bg-white/90 backdrop-blur-sm shadow-lg"
              />
            </div>
            
            <select
              value={bloodTypeFilter}
              onChange={(e) => setBloodTypeFilter(e.target.value)}
              className="px-6 py-4 border-2 border-pink-200 rounded-2xl focus:ring-4 focus:ring-pink-500/20 focus:border-pink-500 transition-all duration-300 bg-white/90 backdrop-blur-sm shadow-lg font-medium"
            >
              <option value="">All Blood Types</option>
              {uniqueBloodTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-6 py-4 border-2 border-pink-200 rounded-2xl focus:ring-4 focus:ring-pink-500/20 focus:border-pink-500 transition-all duration-300 bg-white/90 backdrop-blur-sm shadow-lg font-medium"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="flex items-center gap-3 px-6 py-4 border-2 border-pink-200 rounded-2xl hover:bg-pink-50 hover:border-pink-300 transition-all duration-300 bg-white/90 backdrop-blur-sm shadow-lg font-medium hover:shadow-xl transform hover:scale-105"
            >
              <ArrowUpDown className="w-5 h-5 text-pink-500" />
              Date {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>

        {/* Enhanced donor requests table */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
          {loading ? (
            <div className="text-center py-20 text-gray-500">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-pink-200 border-t-pink-600 mx-auto mb-6"></div>
                <div className="absolute inset-0 rounded-full bg-pink-100/20 animate-pulse"></div>
              </div>
              <p className="text-lg font-medium">Loading donor requests...</p>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <div className="p-6 bg-pink-50 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                <Heart className="w-12 h-12 text-pink-300" />
              </div>
              <p className="text-xl font-medium">No donor requests found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-pink-500 to-red-600 text-white">
                  <tr>
                    <th className="px-8 py-6 text-left text-sm font-bold uppercase tracking-wider">
                      Request
                    </th>
                    <th className="px-8 py-6 text-left text-sm font-bold uppercase tracking-wider">
                      Donor
                    </th>
                    <th className="px-8 py-6 text-left text-sm font-bold uppercase tracking-wider">
                      Blood Type
                    </th>
                    <th className="px-8 py-6 text-left text-sm font-bold uppercase tracking-wider">
                      Units
                    </th>
                    <th className="px-8 py-6 text-left text-sm font-bold uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-8 py-6 text-left text-sm font-bold uppercase tracking-wider">
                      Requested
                    </th>
                    <th className="px-8 py-6 text-left text-sm font-bold uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white/80 backdrop-blur-sm divide-y divide-pink-100">
                  {filteredRequests.map((request, index) => (
                    <tr 
                      key={request.donationId} 
                      className={`${index % 2 === 0 ? 'bg-white/60' : 'bg-pink-25/60'} hover:bg-pink-50/80 transition-all duration-300 hover:shadow-lg transform hover:scale-[1.01]`}
                    >
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-4">
                          <Heart className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-gray-900">#{request.donationId}</div>
                          <div className="text-xs text-gray-500">Donation Request</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mr-4">
                          <User className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{request.donorName}</div>
                          <div className="text-xs text-gray-500">{request.donorEmail}</div>
                          <div className="text-xs text-gray-400">{request.donorPhone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="flex items-center">
                        <Heart className="w-5 h-5 text-red-500 mr-3" />
                        <span className="text-lg font-bold text-red-600 bg-red-50 px-3 py-1 rounded-full">{request.bloodType}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <span className="text-sm font-semibold text-gray-900 bg-gray-100 px-3 py-1 rounded-full">{request.unitsRequested}</span>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <span className={`px-3 py-2 rounded-full text-xs font-semibold border-2 ${
                        request.status === 'Pending' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                        request.status === 'Approved' ? 'bg-green-100 text-green-700 border-green-200' :
                        'bg-red-100 text-red-700 border-red-200'
                      }`}>
                        {request.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-700">
                          {new Date(request.requestedDate).toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="flex space-x-2">
                        {request.status === 'Pending' && (
                          <>
                            <button
                              onClick={() => showApprovalDialog(request)}
                              className="text-green-700 hover:text-green-900 px-4 py-2 rounded-lg bg-green-50 hover:bg-green-100 border border-green-200 font-medium transition-all duration-200 hover:shadow-md"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => showRejectDialog(request.donationId)}
                              className="text-red-700 hover:text-red-900 px-4 py-2 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200 font-medium transition-all duration-200 hover:shadow-md"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => {
                            setSelectedRequest(request);
                            setShowDetails(true);
                          }}
                          className="text-blue-700 hover:text-blue-900 px-4 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 font-medium transition-all duration-200 hover:shadow-md"
                        >
                          Details
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>

      {/* Donor Details Modal */}
      {showDetails && selectedRequest && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-all">
            <div className="flex justify-between items-start mb-8">
              <h3 className="text-2xl font-bold text-gray-900">Donor Details</h3>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-8">
              <div className="bg-red-50 rounded-xl p-6">
                <h4 className="font-bold text-red-900 mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Donor Information
                </h4>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm font-medium text-red-700 mb-1">Full Name</p>
                    <p className="font-semibold text-gray-900">{selectedRequest.donorName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-red-700 mb-1">Email</p>
                    <p className="font-semibold text-gray-900">{selectedRequest.donorEmail}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-red-700 mb-1">Phone</p>
                    <p className="font-semibold text-gray-900">{selectedRequest.donorPhone}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="font-bold text-gray-900 mb-4 flex items-center">
                  <Heart className="w-5 h-5 mr-2 text-red-600" />
                  Donation Details
                </h4>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Blood Type</p>
                    <p className="font-bold text-red-600 text-lg">{selectedRequest.bloodType}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Units to Donate</p>
                    <p className="font-semibold text-gray-900">{selectedRequest.unitsRequested}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Status</p>
                    <span className={`px-3 py-2 rounded-full text-sm font-semibold border-2 ${
                      selectedRequest.status === 'Pending' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                      selectedRequest.status === 'Approved' ? 'bg-green-100 text-green-700 border-green-200' :
                      'bg-red-100 text-red-700 border-red-200'
                    }`}>
                      {selectedRequest.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Request Date</p>
                    <p className="font-semibold text-gray-900">{new Date(selectedRequest.requestedDate).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {selectedRequest.notes && (
                <div className="bg-blue-50 rounded-xl p-6">
                  <h4 className="font-bold text-blue-900 mb-4 flex items-center">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    Request Notes
                  </h4>
                  <p className="text-gray-900 leading-relaxed">{selectedRequest.notes}</p>
                </div>
              )}
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={() => setShowDetails(false)}
                className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-xl hover:bg-gray-200 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md transform transition-all">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Reject Donation Request</h3>
            <p className="text-gray-600 mb-6">
              Please provide a reason for rejecting this donation request. The donor will be notified.
            </p>
            
            <textarea
              placeholder="Rejection reason (required)..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full p-4 border border-gray-300 rounded-xl h-28 resize-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              required
            />

            <div className="flex gap-3 mt-8">
              <button
                onClick={rejectRequest}
                disabled={!rejectionReason.trim()}
                className="flex-1 bg-red-600 text-white py-3 px-4 rounded-xl hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
              >
                Reject Request
              </button>
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectingId(null);
                  setRejectionReason('');
                }}
                className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-xl hover:bg-gray-200 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approval Modal */}
      {showApprovalModal && approvingRequest && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md transform transition-all">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Approve Donation Request</h3>
            <p className="text-gray-600 mb-6">
              Donor: <strong>{approvingRequest.donorName}</strong> ({approvingRequest.bloodType})
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Appointment Date</label>
                <input
                  type="date"
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Appointment Time</label>
                <input
                  type="time"
                  value={appointmentTime}
                  onChange={(e) => setAppointmentTime(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={approveRequest}
                disabled={!appointmentDate || !appointmentTime}
                className="flex-1 bg-green-600 text-white py-3 px-4 rounded-xl hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
              >
                Approve & Create Appointment
              </button>
              <button
                onClick={() => {
                  setShowApprovalModal(false);
                  setApprovingRequest(null);
                }}
                className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-xl hover:bg-gray-200 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}