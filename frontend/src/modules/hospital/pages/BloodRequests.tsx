import { useEffect, useState } from 'react';
import { Search, Droplets, Calendar, User } from 'lucide-react';
import { hospitalAPI } from '../services/hospitalAPI';
import type { ApprovalRequest } from '../services/hospitalAPI';

export default function BloodRequests() {
  const [requests, setRequests] = useState<ApprovalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
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

  const loadRequests = async () => {
    setLoading(true);
    try {
      const res = await hospitalAPI.getApprovalRequests();
      setRequests(res);
    } catch (error) {
      console.error('Failed to load requests:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const approveRequest = async (id: number, patientName: string, bloodType: string) => {
    if (!confirm('Approve this blood request?')) return;
    try {
      await hospitalAPI.approveRequest(id);
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
    } catch (error) {
      console.error('Failed to approve request:', error);
      alert('Failed to approve request');
    }
  };

  const rejectRequest = async (id: number) => {
    const notes = prompt('Rejection reason (optional):');
    if (notes === null) return;
    try {
      await hospitalAPI.rejectRequest(id, notes || undefined);
      loadRequests();
      alert('Request rejected successfully');
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

  const filteredRequests = requests.filter(request => {
    const matchesName = request.userName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || request.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesName && matchesStatus;
  });

  return (
    <div className="p-6 bg-gradient-to-br from-red-50 via-white to-red-50 min-h-screen">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <Droplets className="w-8 h-8 text-red-600" />
          Blood Requests
        </h2>
        <p className="text-gray-600">Review and manage patient blood requests</p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by patient name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Requests Grid */}
      <div className="grid gap-6">
        {loading ? (
          <div className="text-center py-8">Loading requests...</div>
        ) : filteredRequests.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No blood requests found</div>
        ) : (
          filteredRequests.map((request) => (
            <div key={request.id} className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <User className="w-6 h-6 text-red-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{request.userName}</h3>
                    <p className="text-gray-600">{request.userEmail}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  request.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                  request.status === 'Approved' ? 'bg-green-100 text-green-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {request.status}
                </span>
              </div>

              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-700">Blood Type: {request.bloodType}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-700">{new Date(request.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="text-gray-700">Request Type: {request.requestType}</div>
              </div>

              {request.doctorNote && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700"><strong>Notes:</strong> {request.doctorNote}</p>
                </div>
              )}

              {request.status === 'Pending' && (
                <div className="flex gap-3">
                  <button
                    onClick={() => approveRequest(request.id, request.userName, request.bloodType || '')}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => rejectRequest(request.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Appointment Creation Modal */}
      {appointmentForm.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Create Appointment</h3>
            <p className="text-gray-600 mb-4">Patient: {appointmentForm.patientName} ({appointmentForm.bloodType})</p>
            
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Doctor Name *"
                value={appointmentForm.doctorName}
                onChange={(e) => setAppointmentForm({...appointmentForm, doctorName: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg"
              />
              <input
                type="date"
                value={appointmentForm.appointmentDate}
                onChange={(e) => setAppointmentForm({...appointmentForm, appointmentDate: e.target.value})}
                min={new Date().toISOString().split('T')[0]}
                className="w-full p-3 border border-gray-300 rounded-lg"
              />
              <input
                type="time"
                value={appointmentForm.appointmentTime}
                onChange={(e) => setAppointmentForm({...appointmentForm, appointmentTime: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg"
              />
              <textarea
                placeholder="Initial notes (optional)"
                value={appointmentForm.doctorNotes}
                onChange={(e) => setAppointmentForm({...appointmentForm, doctorNotes: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg h-20 resize-none"
              />
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={createAppointment}
                className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
              >
                Create Appointment
              </button>
              <button
                onClick={() => setAppointmentForm({...appointmentForm, show: false})}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
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