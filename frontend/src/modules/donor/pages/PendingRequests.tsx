import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface MockDonationRequest {
  id: number;
  bloodType: string;
  unitsRequested: number;
  status: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
  hospitalName: string;
}

export default function PendingRequests() {
  const navigate = useNavigate();
  const [selectedRequest, setSelectedRequest] = useState<MockDonationRequest | null>(null);

  // Mock data for demonstration
  const requests: MockDonationRequest[] = [
    {
      id: 1,
      bloodType: 'O+',
      unitsRequested: 1,
      status: 'Pending',
      notes: 'Available on weekends',
      createdAt: '2024-01-15T10:30:00Z',
      hospitalName: 'Kuala Lumpur General Hospital'
    },
    {
      id: 2,
      bloodType: 'O+',
      unitsRequested: 2,
      status: 'Accepted',
      createdAt: '2024-01-10T14:20:00Z',
      updatedAt: '2024-01-12T09:15:00Z',
      hospitalName: 'Pantai Hospital Kuala Lumpur'
    },
    {
      id: 3,
      bloodType: 'O+',
      unitsRequested: 1,
      status: 'Completed',
      createdAt: '2023-12-20T11:45:00Z',
      updatedAt: '2023-12-22T16:30:00Z',
      hospitalName: 'Prince Court Medical Centre'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };



  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate('/donor/dashboard')}
          className="text-red-600 hover:text-red-700 mb-4"
        >
          ← Back to Dashboard
        </button>
        <h1 className="text-2xl font-bold text-gray-900">My Donation Requests</h1>
        <p className="text-gray-600 mt-2">Track your donation requests and their status</p>
      </div>

      {requests.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500 mb-4">You haven't made any donation requests yet.</p>
          <button
            onClick={() => navigate('/donor/donate')}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition"
          >
            Make Your First Request
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            {requests.map((request) => (
              <div
                key={request.id}
                onClick={() => setSelectedRequest(request)}
                className={`bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-md transition ${
                  selectedRequest?.id === request.id ? 'ring-2 ring-red-500' : ''
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-900">Request #{request.id}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                    {request.status}
                  </span>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>Blood Type: <span className="font-medium">{request.bloodType}</span></p>
                  <p>Units: <span className="font-medium">{request.unitsRequested}</span></p>
                  <p>Applied: <span className="font-medium">{new Date(request.createdAt).toLocaleDateString()}</span></p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            {selectedRequest ? (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Request Details</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Request ID</label>
                    <p className="text-gray-900">#{selectedRequest.id}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedRequest.status)}`}>
                      {selectedRequest.status}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Blood Type</label>
                    <p className="text-gray-900">{selectedRequest.bloodType}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Units Requested</label>
                    <p className="text-gray-900">{selectedRequest.unitsRequested}</p>
                  </div>
                  {selectedRequest.hospitalName && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Hospital</label>
                      <p className="text-gray-900">{selectedRequest.hospitalName}</p>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Applied Date</label>
                    <p className="text-gray-900">{new Date(selectedRequest.createdAt).toLocaleString()}</p>
                  </div>
                  {selectedRequest.updatedAt && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Last Updated</label>
                      <p className="text-gray-900">{new Date(selectedRequest.updatedAt).toLocaleString()}</p>
                    </div>
                  )}
                  {selectedRequest.notes && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Notes</label>
                      <p className="text-gray-900">{selectedRequest.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500">
                <p>Select a request to view details</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}