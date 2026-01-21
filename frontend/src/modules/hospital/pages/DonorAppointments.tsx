import React, { useState, useEffect } from 'react';
import { Search, ArrowUpDown, Heart } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { hospitalAPI } from '../services/hospitalAPI';

interface DonorAppointment {
  appointmentId: number;
  donorName: string;
  bloodType: string;
  appointmentDate: string;
  appointmentTime: string;
  status: string;
  createdAt: string;
}

const DonorAppointments: React.FC = () => {
  console.log('🚀 DonorAppointments component loaded');
  const [appointments, setAppointments] = useState<DonorAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [bloodTypeFilter, setBloodTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const { user, isLoading: authLoading } = useAuth();
  
  console.log('👤 Current user:', user);
  console.log('⏳ Auth loading:', authLoading);

  const handleMarkDone = async (appointmentId: number) => {
    if (confirm('Are you sure this appointment is done?')) {
      try {
        const response = await hospitalAPI.completeDonorAppointment(appointmentId);
        if (response.success) {
          // Refresh the list
          if ((user as any)?.user?.id) {
            const userId = (user as any).user.id;
            const refreshResponse = await hospitalAPI.getDonorAppointments(userId);
            if (refreshResponse.success) {
              setAppointments(refreshResponse.data || []);
            }
          }
        } else {
          alert('Failed to mark appointment as done');
        }
      } catch (error) {
        console.error('Error marking appointment as done:', error);
        alert('Failed to mark appointment as done');
      }
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      // Wait for auth to complete
      if (authLoading) return;
      
      // If no user after auth completes, stop loading
      if (!(user as any)?.user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const userId = (user as any).user.id;
        console.log('🔍 Fetching donor appointments for user:', userId);
        console.log('🌐 API URL:', `https://bloodline.dev/api/hospital/donor-appointments/${userId}`);
        
        // Fetch real data from donor_appointments table
        const response = await hospitalAPI.getDonorAppointments(userId);
        console.log('📦 API Response:', JSON.stringify(response, null, 2));
        
        if (response.success) {
          console.log('✅ Success - appointments data:', response.data);
          setAppointments(response.data || []);
        } else {
          console.error('❌ API returned unsuccessful response:', JSON.stringify(response, null, 2));
          setAppointments([]);
        }
      } catch (error) {
        console.error('💥 Error fetching donor appointments:', error);
        // Check if error is due to HTML response (endpoint not deployed)
        if (error instanceof Error && error.message.includes('text/html')) {
          console.error('🚨 Backend endpoint not deployed - received HTML instead of JSON');
        }
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Auto-refresh every 30 seconds to show new appointments
    const interval = setInterval(fetchData, 30000);
    
    // Fallback timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (loading) {
        console.log('Timeout reached, stopping loading');
        setLoading(false);
      }
    }, 10000);
    
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [user, authLoading]);

  // Show loading while auth is loading OR data is loading
  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        <p>Loading donor appointments...</p>
      </div>
    );
  }

  // Show message if no user
  if (!user) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Please log in to view donor appointments.</p>
      </div>
    );
  }

  // Filter and sort appointments
  const filteredAppointments = appointments
    .filter(apt => 
      (!searchTerm || apt.donorName.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (!bloodTypeFilter || apt.bloodType === bloodTypeFilter) &&
      (!statusFilter || apt.status.toLowerCase() === statusFilter.toLowerCase())
    )
    .sort((a, b) => {
      const dateA = new Date(a.appointmentDate).getTime();
      const dateB = new Date(b.appointmentDate).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

  // Get unique blood types for filter
  const uniqueBloodTypes = [...new Set(appointments.map(apt => apt.bloodType))].sort();

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'upcoming':
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="p-8">
        {/* Enhanced page header */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-3xl p-8 text-white shadow-2xl mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold flex items-center gap-3 mb-2">
                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                  <Heart className="w-8 h-8" />
                </div>
                Donor Appointments
              </h1>
              <p className="text-blue-100 text-lg">Manage and view all donor appointments</p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-2xl hover:bg-white/30 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Enhanced filters */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/50 mb-8">
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[300px]">
              <Search className="w-5 h-5 absolute left-4 top-4 text-blue-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by donor name..."
                className="w-full pl-12 pr-4 py-4 border-2 border-blue-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-white/90 backdrop-blur-sm shadow-lg"
              />
            </div>
            
            <select
              value={bloodTypeFilter}
              onChange={(e) => setBloodTypeFilter(e.target.value)}
              className="px-6 py-4 border-2 border-blue-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-white/90 backdrop-blur-sm shadow-lg font-medium"
            >
              <option value="">All Blood Types</option>
              {uniqueBloodTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-6 py-4 border-2 border-blue-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-white/90 backdrop-blur-sm shadow-lg font-medium"
            >
              <option value="">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="flex items-center gap-3 px-6 py-4 border-2 border-blue-200 rounded-2xl hover:bg-blue-50 hover:border-blue-300 transition-all duration-300 bg-white/90 backdrop-blur-sm shadow-lg font-medium hover:shadow-xl transform hover:scale-105"
            >
              <ArrowUpDown className="w-5 h-5 text-blue-500" />
              Date {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>

        {/* Enhanced appointments table */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-blue-200">
              <thead className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                <tr>
                  <th className="px-8 py-6 text-left text-sm font-bold uppercase tracking-wider">
                    Donor Name
                  </th>
                  <th className="px-8 py-6 text-left text-sm font-bold uppercase tracking-wider">
                    Blood Type
                  </th>
                  <th className="px-8 py-6 text-left text-sm font-bold uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-8 py-6 text-left text-sm font-bold uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-8 py-6 text-left text-sm font-bold uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-8 py-6 text-left text-sm font-bold uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-8 py-6 text-left text-sm font-bold uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white/80 backdrop-blur-sm divide-y divide-blue-100">
                {filteredAppointments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center text-gray-500">
                      <div className="p-6 bg-blue-50 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                        <Heart className="w-12 h-12 text-blue-300" />
                      </div>
                      <p className="text-xl font-medium">No donor appointments found</p>
                    </td>
                  </tr>
                ) : (
                  filteredAppointments.map((appointment, index) => (
                    <tr key={appointment.appointmentId} className={`${index % 2 === 0 ? 'bg-white/60' : 'bg-blue-25/60'} hover:bg-blue-50/80 transition-all duration-300 hover:shadow-lg transform hover:scale-[1.01]`}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {appointment.donorName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          {appointment.bloodType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {appointment.appointmentDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {appointment.appointmentTime}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                          {appointment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {appointment.createdAt}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {appointment.status.toLowerCase() === 'scheduled' && (
                          <button
                            onClick={() => handleMarkDone(appointment.appointmentId)}
                            className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                          >
                            DONE
                          </button>
                        )}
                      </td>
                    </tr>
                ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonorAppointments;