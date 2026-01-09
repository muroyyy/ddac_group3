import React, { useState, useEffect } from 'react';
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
  const { user, isLoading: authLoading } = useAuth();
  
  console.log('👤 Current user:', user);
  console.log('⏳ Auth loading:', authLoading);

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
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Donor Appointments</h1>
          <p className="text-gray-600">Manage and view all donor appointments</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Refresh
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Donor Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Blood Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {appointments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No donor appointments found
                  </td>
                </tr>
              ) : (
                appointments.map((appointment) => (
                  <tr key={appointment.appointmentId} className="hover:bg-gray-50">
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
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DonorAppointments;