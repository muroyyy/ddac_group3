import React, { useState, useEffect } from 'react';
import { hospitalAPI } from '../../../api/hospital.api';
import { useAuth } from '../../../hooks/useAuth';

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
  console.log('DonorAppointments component mounted');
  const [appointments, setAppointments] = useState<DonorAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  
  console.log('Component render, user:', user);

  useEffect(() => {
    console.log('useEffect triggered, user:', user);
    if (user?.id) {
      console.log('User ID found, calling fetchDonorAppointments');
      fetchDonorAppointments();
    } else {
      console.log('No user ID, not fetching appointments');
    }
  }, [user]);

  const fetchDonorAppointments = async () => {
    try {
      console.log('Fetching donor appointments for user:', user?.id);
      setLoading(true);
      if (user?.id) {
        const response = await hospitalAPI.getDonorAppointments(user.id);
        console.log('API response:', response);
        if (response.success) {
          setAppointments(response.data);
        } else {
          console.error('API returned error:', response.message);
        }
      } else {
        console.log('No user ID available');
      }
    } catch (error) {
      console.error('Error fetching donor appointments:', error);
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    console.log('Component is in loading state');
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        <p>Loading donor appointments...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Donor Appointments</h1>
        <p className="text-gray-600">Manage and view all donor appointments</p>
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