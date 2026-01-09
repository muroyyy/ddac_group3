import { useEffect, useState } from 'react';
import { Search, Heart, Calendar, User, AlertCircle } from 'lucide-react';
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
  const [selectedRequest, setSelectedRequest] = useState<DonorRequest | null>(null);
  const [showDetails, setShowDetails] = useState(false);

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

  const filteredRequests = requests.filter(request => 
    request.donorName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Heart className="w-6 h-6 text-red-600" />
          Donor Requests
        </h1>
        <p className="text-gray-600">
          Review and manage blood donation requests from donors
        </p>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by donor name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="text-center py-16 text-gray-500">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600 mx-auto mb-4"></div>
            Loading donor requests...
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            No donor requests found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-red-50 to-red-100 border-b border-red-200">
                <tr>
                  <th className="px-8 py-5 text-left text-sm font-semibold text-red-800 uppercase tracking-wider">
                    Request
                  </th>
                  <th className="px-8 py-5 text-left text-sm font-semibold text-red-800 uppercase tracking-wider">
                    Donor
                  </th>
                  <th className="px-8 py-5 text-left text-sm font-semibold text-red-800 uppercase tracking-wider">
                    Blood Type
                  </th>
                  <th className="px-8 py-5 text-left text-sm font-semibold text-red-800 uppercase tracking-wider">
                    Units
                  </th>
                  <th className="px-8 py-5 text-left text-sm font-semibold text-red-800 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-8 py-5 text-left text-sm font-semibold text-red-800 uppercase tracking-wider">
                    Requested
                  </th>
                  <th className="px-8 py-5 text-left text-sm font-semibold text-red-800 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredRequests.map((request, index) => (
                  <tr 
                    key={request.donationId} 
                    className={`${index % 2 === 0 ? 'bg-white' : 'bg-red-25'} hover:bg-red-50 transition-colors duration-200`}
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
                      <button
                        onClick={() => {
                          setSelectedRequest(request);
                          setShowDetails(true);
                        }}
                        className="text-blue-700 hover:text-blue-900 px-4 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 font-medium transition-all duration-200 hover:shadow-md"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
    </div>
  );
}