// Import React hooks and icons for blood requests management
import { useEffect, useState } from 'react';
import { Search, Droplets, Calendar, User, AlertCircle, Phone, Heart } from 'lucide-react';
import { hospitalAPI } from '../services/hospitalAPI';
import { useAuth } from '../../../context/AuthContext';

// Define interface for blood request data structure
interface BloodRequest {
  requestId: number;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  bloodType: string;
  unitsRequired: number;
  urgencyLevel: string;
  status: string;
  notes: string;
  rejectionNotes?: string;
  createdAt: string;
  emergencyContact: string;
  allergies: string;
  medicalCondition: string;
}

// Main component for hospital staff to manage blood requests
export default function BloodRequests() {
  // Get current user from auth context for hospital scoping
  const { user } = useAuth();
  // State management for requests and UI
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<BloodRequest | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  
  // Appointment creation form state
  const [appointmentForm, setAppointmentForm] = useState<{
    show: boolean;
    requestId: number;
    patientName: string;
    bloodType: string;
    doctorName: string;
    appointmentDate: string;
    appointmentTime: string;
    doctorNotes: string;
  }>({
    show: false,
    requestId: 0,
    patientName: '',
    bloodType: '',
    doctorName: '',
    appointmentDate: '',
    appointmentTime: '',
    doctorNotes: ''
  });

  // Function to load blood requests for this hospital staff member
  const loadRequests = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      // Call API with user ID to get hospital-scoped requests
      const res = await hospitalAPI.getBloodRequests(user.id);
      if (res.success) {
        setRequests(res.data);
      } else {
        console.error('Failed to load requests:', res.message);
      }
    } catch (error) {
      console.error('Failed to load requests:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  // Function to approve a blood request and show appointment creation form
  const approveRequest = async (id: number, patientName: string, bloodType: string) => {
    if (!confirm('Approve this blood request? This will notify the patient.')) return;
    try {
      const result = await hospitalAPI.approveRequest(id);
      if (result.success) {
        // Show appointment creation form after successful approval
        setAppointmentForm({
          show: true,
          requestId: id,
          patientName,
          bloodType,
          doctorName: '',
          appointmentDate: '',
          appointmentTime: '',
          doctorNotes: ''
        });
        loadRequests();
        alert('Request approved! Please create an appointment.');
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

  const createAppointment = async () => {
    if (!appointmentForm.doctorName || !appointmentForm.appointmentDate || !appointmentForm.appointmentTime) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const appointmentDateTime = new Date(`${appointmentForm.appointmentDate}T${appointmentForm.appointmentTime}`);
      await hospitalAPI.createAppointment({
        requestId: appointmentForm.requestId,
        doctorName: appointmentForm.doctorName,
        appointmentDate: appointmentDateTime,
        initialNotes: appointmentForm.doctorNotes || undefined
      });
      
      setAppointmentForm({ ...appointmentForm, show: false });
      alert('Appointment created successfully!');
      loadRequests();
    } catch (error) {
      console.error('Failed to create appointment:', error);
      alert('Failed to create appointment');
    }
  };

  // Filter requests based on search term and status
  const filteredRequests = requests.filter(request => {
    const matchesName = request.patientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || request.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesName && matchesStatus;
  });

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
    <div className="space-y-6">
      {/* Page header matching patient module style */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Droplets className="w-6 h-6 text-red-600" />
          Blood Requests
        </h1>
        <p className="text-gray-600">
          Review and manage patient blood requests for your hospital
        </p>
      </div>

      {/* Search and filter controls */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by patient name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Blood requests list */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading blood requests...</div>
        ) : filteredRequests.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No blood requests found
          </div>
        ) : (
          filteredRequests.map((request) => (
            <div key={request.requestId} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer">
              {/* Header with patient info and status */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{request.patientName}</h3>
                    <p className="text-gray-600 text-sm">{request.patientEmail}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600 text-sm">{request.patientPhone}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    request.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                    request.status === 'Approved' ? 'bg-green-100 text-green-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {request.status}
                  </span>
                  <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${getUrgencyStyle(request.urgencyLevel)}`}>
                    {request.urgencyLevel} Priority
                  </span>
                </div>
              </div>

              {/* Request details grid */}
              <div className="grid md:grid-cols-4 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-red-500" />
                  <div>
                    <p className="text-xs text-gray-500">Blood Type</p>
                    <p className="font-semibold text-gray-900">{request.bloodType}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-blue-500" />
                  <div>
                    <p className="text-xs text-gray-500">Units Required</p>
                    <p className="font-semibold text-gray-900">{request.unitsRequired}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">Requested</p>
                    <p className="font-semibold text-gray-900">{new Date(request.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-pink-500" />
                  <div>
                    <p className="text-xs text-gray-500">Emergency Contact</p>
                    <p className="font-semibold text-gray-900 text-sm">{request.emergencyContact}</p>
                  </div>
                </div>
              </div>

              {/* Medical information */}
              {(request.medicalCondition || request.allergies || request.notes) && (
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Medical Information</h4>
                  {request.medicalCondition && (
                    <p className="text-sm text-gray-700 mb-1">
                      <strong>Condition:</strong> {request.medicalCondition}
                    </p>
                  )}
                  {request.allergies && (
                    <p className="text-sm text-gray-700 mb-1">
                      <strong>Allergies:</strong> {request.allergies}
                    </p>
                  )}
                  {request.notes && (
                    <p className="text-sm text-gray-700">
                      <strong>Notes:</strong> {request.notes}
                    </p>
                  )}
                </div>
              )}

              {/* Rejection notes if rejected */}
              {request.status === 'Rejected' && request.rejectionNotes && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">
                    <strong>Rejection Reason:</strong> {request.rejectionNotes}
                  </p>
                </div>
              )}

              {/* Action buttons for pending requests */}
              {request.status === 'Pending' && (
                <div className="flex gap-3">
                  <button
                    onClick={() => approveRequest(request.requestId, request.patientName, request.bloodType)}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    Approve Request
                  </button>
                  <button
                    onClick={() => showRejectDialog(request.requestId)}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                  >
                    Reject Request
                  </button>
                  <button
                    onClick={() => {
                      setSelectedRequest(request);
                      setShowDetails(true);
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                  >
                    View Details
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Rejection Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Reject Blood Request</h3>
            <p className="text-gray-600 mb-4">
              Please provide a reason for rejecting this request. The patient will be notified.
            </p>
            
            <textarea
              placeholder="Rejection reason (required)..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg h-24 resize-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              required
            />

            <div className="flex gap-3 mt-6">
              <button
                onClick={rejectRequest}
                disabled={!rejectionReason.trim()}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Reject Request
              </button>
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectingId(null);
                  setRejectionReason('');
                }}
                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Patient Details Modal */}
      {showDetails && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Patient Details</h3>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Patient Information */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Patient Information</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Full Name</p>
                    <p className="font-medium">{selectedRequest.patientName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{selectedRequest.patientEmail}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium">{selectedRequest.patientPhone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Emergency Contact</p>
                    <p className="font-medium">{selectedRequest.emergencyContact}</p>
                  </div>
                </div>
              </div>

              {/* Request Details */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Request Details</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Blood Type</p>
                    <p className="font-medium text-red-600">{selectedRequest.bloodType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Units Required</p>
                    <p className="font-medium">{selectedRequest.unitsRequired}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Urgency Level</p>
                    <span className={`px-2 py-1 rounded text-sm font-medium ${getUrgencyStyle(selectedRequest.urgencyLevel)}`}>
                      {selectedRequest.urgencyLevel}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Request Date</p>
                    <p className="font-medium">{new Date(selectedRequest.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Medical Information */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Medical Information</h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Medical Condition</p>
                    <p className="font-medium">{selectedRequest.medicalCondition || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Allergies</p>
                    <p className="font-medium">{selectedRequest.allergies || 'None reported'}</p>
                  </div>
                  {selectedRequest.notes && (
                    <div>
                      <p className="text-sm text-gray-500">Additional Notes</p>
                      <p className="font-medium">{selectedRequest.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t">
              <button
                onClick={() => setShowDetails(false)}
                className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Appointment Creation Modal */}
      {appointmentForm.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Create Appointment</h3>
            <p className="text-gray-600 mb-4">
              Patient: <strong>{appointmentForm.patientName}</strong> ({appointmentForm.bloodType})
            </p>
            
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Doctor Name *"
                value={appointmentForm.doctorName}
                onChange={(e) => setAppointmentForm({...appointmentForm, doctorName: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
              <input
                type="date"
                value={appointmentForm.appointmentDate}
                onChange={(e) => setAppointmentForm({...appointmentForm, appointmentDate: e.target.value})}
                min={new Date().toISOString().split('T')[0]}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
              <input
                type="time"
                value={appointmentForm.appointmentTime}
                onChange={(e) => setAppointmentForm({...appointmentForm, appointmentTime: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
              <textarea
                placeholder="Initial notes (optional)"
                value={appointmentForm.doctorNotes}
                onChange={(e) => setAppointmentForm({...appointmentForm, doctorNotes: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg h-20 resize-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={createAppointment}
                className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Create Appointment
              </button>
              <button
                onClick={() => setAppointmentForm({...appointmentForm, show: false})}
                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors"
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