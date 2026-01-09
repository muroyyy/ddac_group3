import { useEffect, useState } from 'react';
import { Search, Calendar, User, Heart } from 'lucide-react';
import { hospitalAPI } from '../services/hospitalAPI';
import { useAuth } from '../../../context/AuthContext';

interface DonorAppointment {
  appointmentId: number;
  donorName: string;
  donorEmail: string;
  donorPhone: string;
  bloodType: string;
  appointmentDate: string;
  appointmentTime: string;
  status: string;
  unitsCollected?: number;
}

export default function DonorAppointments() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<DonorAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState<DonorAppointment | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const loadAppointments = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const response = await hospitalAPI.getDonorAppointments(user.id);
      if (response.success) {
        setAppointments(response.data || []);
      }
    } catch (error) {
      console.error('Failed to load appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const filteredAppointments = appointments.filter(appointment => 
    appointment.donorName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'completed': return 'bg-green-100 text-green-700 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Calendar className="w-6 h-6 text-red-600" />
          Donor Appointments
        </h1>
        <p className="text-gray-600">
          Manage blood donation appointments
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
            Loading appointments...
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            No donor appointments found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-red-50 to-red-100 border-b border-red-200">
                <tr>
                  <th className="px-8 py-5 text-left text-sm font-semibold text-red-800 uppercase tracking-wider">
                    Appointment
                  </th>
                  <th className="px-8 py-5 text-left text-sm font-semibold text-red-800 uppercase tracking-wider">
                    Donor
                  </th>
                  <th className="px-8 py-5 text-left text-sm font-semibold text-red-800 uppercase tracking-wider">
                    Blood Type
                  </th>
                  <th className="px-8 py-5 text-left text-sm font-semibold text-red-800 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-8 py-5 text-left text-sm font-semibold text-red-800 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-8 py-5 text-left text-sm font-semibold text-red-800 uppercase tracking-wider">
                    Units
                  </th>
                  <th className="px-8 py-5 text-left text-sm font-semibold text-red-800 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredAppointments.map((appointment, index) => (
                  <tr 
                    key={appointment.appointmentId} 
                    className={`${index % 2 === 0 ? 'bg-white' : 'bg-red-25'} hover:bg-red-50 transition-colors duration-200`}
                  >
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-4">
                          <Calendar className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-gray-900">#{appointment.appointmentId}</div>
                          <div className="text-xs text-gray-500">Donation Appointment</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mr-4">
                          <User className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{appointment.donorName}</div>
                          <div className="text-xs text-gray-500">{appointment.donorEmail}</div>
                          <div className="text-xs text-gray-400">{appointment.donorPhone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="flex items-center">
                        <Heart className="w-5 h-5 text-red-500 mr-3" />
                        <span className="text-lg font-bold text-red-600 bg-red-50 px-3 py-1 rounded-full">{appointment.bloodType}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-semibold text-gray-900">{appointment.appointmentDate}</div>
                        <div className="text-xs text-gray-500">{appointment.appointmentTime}</div>
                      </div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <span className={`px-3 py-2 rounded-full text-xs font-semibold border-2 ${getStatusStyle(appointment.status)}`}>
                        {appointment.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <span className="text-sm font-semibold text-gray-900 bg-gray-100 px-3 py-1 rounded-full">
                        {appointment.unitsCollected || 0}
                      </span>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <button
                        onClick={() => {
                          setSelectedAppointment(appointment);
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

      {/* Appointment Details Modal */}
      {showDetails && selectedAppointment && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-all">
            <div className="flex justify-between items-start mb-8">
              <h3 className="text-2xl font-bold text-gray-900">Appointment Details</h3>
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
                    <p className="font-semibold text-gray-900">{selectedAppointment.donorName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-red-700 mb-1">Email</p>
                    <p className="font-semibold text-gray-900">{selectedAppointment.donorEmail}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-red-700 mb-1">Phone</p>
                    <p className="font-semibold text-gray-900">{selectedAppointment.donorPhone}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-red-700 mb-1">Blood Type</p>
                    <p className="font-bold text-red-600 text-lg">{selectedAppointment.bloodType}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="font-bold text-gray-900 mb-4 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-red-600" />
                  Appointment Details
                </h4>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Date</p>
                    <p className="font-semibold text-gray-900">{selectedAppointment.appointmentDate}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Time</p>
                    <p className="font-semibold text-gray-900">{selectedAppointment.appointmentTime}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Status</p>
                    <span className={`px-3 py-2 rounded-full text-sm font-semibold border-2 ${getStatusStyle(selectedAppointment.status)}`}>
                      {selectedAppointment.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Units Collected</p>
                    <p className="font-semibold text-gray-900">{selectedAppointment.unitsCollected || 0}</p>
                  </div>
                </div>
              </div>
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