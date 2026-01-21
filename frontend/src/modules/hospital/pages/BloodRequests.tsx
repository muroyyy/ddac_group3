// Import React hooks and icons for blood requests management
import { useEffect, useState } from 'react';
import { Search, Droplets, Calendar, User, AlertCircle, ArrowUpDown } from 'lucide-react';
import { hospitalAPI } from '../services/hospitalAPI';
import { useAuth } from '../../../context/AuthContext';

// Define interface for blood request data structure
interface BloodRequest {
  requestId: number;
  patientId: number;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  bloodType: string;
  unitsRequired: number;
  urgencyLevel: string;
  status: string;
  notes: string;
  createdAt: string;
}

interface Doctor {
  doctorId: number;
  doctorName: string;
  specialization: string;
  contactNumber: string;
}

// Main component for hospital staff to manage blood requests
export default function BloodRequests() {
  // Get current user from auth context for hospital scoping
  const { user } = useAuth();
  // State management for requests and UI
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [bloodTypeFilter, setBloodTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedRequest, setSelectedRequest] = useState<BloodRequest | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  
  // Approval modal state
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvingRequest, setApprovingRequest] = useState<BloodRequest | null>(null);
  const [selectedDoctorId, setSelectedDoctorId] = useState<number>(0);
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');

  // Function to load blood requests and doctors
  const loadRequests = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const [requestsRes, doctorsRes] = await Promise.all([
        hospitalAPI.getBloodRequests(user.id),
        hospitalAPI.getDoctors(user.id)
      ]);
      
      if (requestsRes.success) {
        setRequests(requestsRes.data || []);
      }
      
      if (doctorsRes.success) {
        setDoctors(doctorsRes.data || []);
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

  // Function to show approval modal
  const showApprovalDialog = (request: BloodRequest) => {
    setApprovingRequest(request);
    setSelectedDoctorId(0);
    setAppointmentDate('');
    setAppointmentTime('');
    setShowApprovalModal(true);
  };

  // Function to approve request with appointment details
  const approveRequest = async () => {
    if (!approvingRequest || !selectedDoctorId || !appointmentDate || !appointmentTime) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const appointmentDateTime = new Date(`${appointmentDate}T${appointmentTime}`);
      const result = await hospitalAPI.approveRequest(approvingRequest.requestId, {
        doctorId: selectedDoctorId,
        appointmentDate: appointmentDateTime
      });
      
      if (result.success) {
        setShowApprovalModal(false);
        setApprovingRequest(null);
        loadRequests();
        alert('Request approved and appointment created successfully!');
      } else {
        alert('Failed to approve request');
      }
    } catch (error) {
      console.error('Failed to approve request:', error);
      alert('Failed to approve request');
    }
  };

  // Function to show rejection modal
  const showRejectDialog = (id: number) => {
    setRejectingId(id);
    setRejectionReason('');
    setShowRejectModal(true);
  };

  // Function to reject a blood request with reason
  const rejectRequest = async () => {
    if (!rejectingId) return;
    try {
      const result = await hospitalAPI.rejectRequest(rejectingId, rejectionReason);
      if (result.success) {
        setShowRejectModal(false);
        setRejectingId(null);
        setRejectionReason('');
        loadRequests();
        alert('Request rejected successfully. Patient has been notified.');
      } else {
        alert('Failed to reject request');
      }
    } catch (error) {
      console.error('Failed to reject request:', error);
      alert('Failed to reject request');
    }
  };



  // Filter requests based on search term, blood type, and status
  const filteredRequests = requests
    .filter(request => 
      (!searchTerm || request.patientName.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (!bloodTypeFilter || request.bloodType === bloodTypeFilter) &&
      (!statusFilter || request.urgencyLevel.toLowerCase() === statusFilter.toLowerCase())
    )
    .sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

  // Get unique blood types and urgency levels for filters
  const uniqueBloodTypes = [...new Set(requests.map(req => req.bloodType))].sort();
  const uniqueUrgencyLevels = [...new Set(requests.map(req => req.urgencyLevel))].sort();

  // Function to get urgency level styling
  const getUrgencyStyle = (urgency: string) => {
    switch (urgency.toLowerCase()) {
      case 'critical': return 'bg-red-100 text-red-700 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50">
      <div className="space-y-8 ml-6 mr-6 py-8">
        {/* Page header with enhanced styling */}
        <div className="bg-gradient-to-r from-red-500 to-pink-600 rounded-3xl p-8 text-white shadow-2xl">
          <h1 className="text-4xl font-bold flex items-center gap-3 mb-2">
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
              <Droplets className="w-8 h-8" />
            </div>
            Blood Requests
          </h1>
          <p className="text-red-100 text-lg">
            Review and manage patient blood requests for your hospital
          </p>
        </div>

        {/* Enhanced search controls */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/50">
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[300px]">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-red-400" />
              <input
                id="search-patients"
                type="text"
                placeholder="Search by patient name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border-2 border-red-200 rounded-2xl focus:ring-4 focus:ring-red-500/20 focus:border-red-500 transition-all duration-300 bg-white/90 backdrop-blur-sm shadow-lg"
              />
            </div>
            
            <select
              value={bloodTypeFilter}
              onChange={(e) => setBloodTypeFilter(e.target.value)}
              className="px-6 py-4 border-2 border-red-200 rounded-2xl focus:ring-4 focus:ring-red-500/20 focus:border-red-500 transition-all duration-300 bg-white/90 backdrop-blur-sm shadow-lg font-medium"
            >
              <option value="">All Blood Types</option>
              {uniqueBloodTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-6 py-4 border-2 border-red-200 rounded-2xl focus:ring-4 focus:ring-red-500/20 focus:border-red-500 transition-all duration-300 bg-white/90 backdrop-blur-sm shadow-lg font-medium"
            >
              <option value="">All Urgency</option>
              {uniqueUrgencyLevels.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
            
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="flex items-center gap-3 px-6 py-4 border-2 border-red-200 rounded-2xl hover:bg-red-50 hover:border-red-300 transition-all duration-300 bg-white/90 backdrop-blur-sm shadow-lg font-medium hover:shadow-xl transform hover:scale-105"
            >
              <ArrowUpDown className="w-5 h-5 text-red-500" />
              Date {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>

        {/* Enhanced blood requests table */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
          {loading ? (
            <div className="text-center py-20 text-gray-500">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-200 border-t-red-600 mx-auto mb-6"></div>
                <div className="absolute inset-0 rounded-full bg-red-100/20 animate-pulse"></div>
              </div>
              <p className="text-lg font-medium">Loading blood requests...</p>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <div className="p-6 bg-red-50 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                <Droplets className="w-12 h-12 text-red-300" />
              </div>
              <p className="text-xl font-medium">No blood requests found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-red-500 to-pink-600 text-white">
                  <tr>
                    <th className="px-8 py-6 text-left text-sm font-bold uppercase tracking-wider">
                      Request
                    </th>
                    <th className="px-8 py-6 text-left text-sm font-bold uppercase tracking-wider">
                      Patient
                    </th>
                    <th className="px-8 py-6 text-left text-sm font-bold uppercase tracking-wider">
                      Blood Type
                    </th>
                    <th className="px-8 py-6 text-left text-sm font-bold uppercase tracking-wider">
                      Units
                    </th>
                    <th className="px-8 py-6 text-left text-sm font-bold uppercase tracking-wider">
                      Urgency
                    </th>
                    <th className="px-8 py-6 text-left text-sm font-bold uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-8 py-6 text-left text-sm font-bold uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white/80 backdrop-blur-sm divide-y divide-red-100">
                  {filteredRequests.map((request, index) => (
                    <tr 
                      key={request.requestId} 
                      className={`${index % 2 === 0 ? 'bg-white/60' : 'bg-red-25/60'} hover:bg-red-50/80 transition-all duration-300 hover:shadow-lg transform hover:scale-[1.01]`}
                    >
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-pink-500 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                            <AlertCircle className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-gray-900">#{request.requestId}</div>
                            <div className="text-xs text-red-500 font-medium">Blood Request</div>
                          </div>
                        </div>
                      </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mr-4">
                          <User className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{request.patientName}</div>
                          <div className="text-xs text-gray-500">{request.patientEmail}</div>
                          <div className="text-xs text-gray-400">{request.patientPhone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="flex items-center">
                        <Droplets className="w-5 h-5 text-red-500 mr-3" />
                        <span className="text-lg font-bold text-red-600 bg-red-50 px-3 py-1 rounded-full">{request.bloodType}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <span className="text-sm font-semibold text-gray-900 bg-gray-100 px-3 py-1 rounded-full">{request.unitsRequired}</span>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <span className={`px-3 py-2 rounded-full text-xs font-semibold border-2 ${getUrgencyStyle(request.urgencyLevel)}`}>
                        {request.urgencyLevel}
                      </span>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-700">
                          {new Date(request.createdAt).toLocaleDateString()}
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
                              onClick={() => showRejectDialog(request.requestId)}
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

      {/* Rejection Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md transform transition-all">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Reject Blood Request</h3>
            <p className="text-gray-600 mb-6">
              Please provide a reason for rejecting this request. The patient will be notified.
            </p>
            
            <textarea
              id="rejection-reason"
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

      {/* Patient Details Modal */}
      {showDetails && selectedRequest && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-all">
            <div className="flex justify-between items-start mb-8">
              <h3 className="text-2xl font-bold text-gray-900">Patient Details</h3>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-8">
              {/* Patient Information */}
              <div className="bg-red-50 rounded-xl p-6">
                <h4 className="font-bold text-red-900 mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Patient Information
                </h4>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm font-medium text-red-700 mb-1">Full Name</p>
                    <p className="font-semibold text-gray-900">{selectedRequest.patientName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-red-700 mb-1">Email</p>
                    <p className="font-semibold text-gray-900">{selectedRequest.patientEmail}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-red-700 mb-1">Phone</p>
                    <p className="font-semibold text-gray-900">{selectedRequest.patientPhone}</p>
                  </div>
                </div>
              </div>

              {/* Request Details */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="font-bold text-gray-900 mb-4 flex items-center">
                  <Droplets className="w-5 h-5 mr-2 text-red-600" />
                  Request Details
                </h4>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Blood Type</p>
                    <p className="font-bold text-red-600 text-lg">{selectedRequest.bloodType}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Units Required</p>
                    <p className="font-semibold text-gray-900">{selectedRequest.unitsRequired}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Urgency Level</p>
                    <span className={`px-3 py-2 rounded-full text-sm font-semibold border-2 ${getUrgencyStyle(selectedRequest.urgencyLevel)}`}>
                      {selectedRequest.urgencyLevel}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Request Date</p>
                    <p className="font-semibold text-gray-900">{new Date(selectedRequest.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Medical Information */}
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

      {/* Approval Modal */}
      {showApprovalModal && approvingRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-30 overflow-y-auto h-full w-full flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md transform transition-all">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Approve Blood Request</h3>
            <p className="text-gray-600 mb-6">
              Patient: <strong>{approvingRequest.patientName}</strong> ({approvingRequest.bloodType})
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Doctor</label>
                <select
                  id="doctor-select"
                  value={selectedDoctorId}
                  onChange={(e) => setSelectedDoctorId(Number(e.target.value))}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value={0}>Select a doctor...</option>
                  {doctors.map(doctor => (
                    <option key={doctor.doctorId} value={doctor.doctorId}>
                      {doctor.doctorName} - {doctor.specialization}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Appointment Date</label>
                <input
                  id="appointment-date"
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
                  id="appointment-time"
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
                disabled={!selectedDoctorId || !appointmentDate || !appointmentTime}
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