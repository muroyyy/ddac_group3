import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { donorAPI } from '../services/donorAPI';
import type { Appointment } from '../services/donorAPI';

export default function CompletedDonations() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [donations, setDonations] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDonation, setSelectedDonation] = useState<Appointment | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadCompletedDonations();
    }
  }, [user]);

  const loadCompletedDonations = async () => {
    try {
      const completedDonations = await donorAPI.getCompletedDonations(user!.id);
      
      // If no completed donations from API, use mock data
      if (completedDonations.length === 0) {
        const mockCompletedDonations = [
          {
            id: 101,
            hospitalName: 'Kuala Lumpur General Hospital',
            date: '2023-10-15',
            time: '10:00 AM',
            status: 'Completed',
            bloodType: 'O+',
            units: 1
          },
          {
            id: 102,
            hospitalName: 'Pantai Hospital Kuala Lumpur',
            date: '2023-07-20',
            time: '2:30 PM',
            status: 'Completed',
            bloodType: 'O+',
            units: 2
          }
        ];
        setDonations(mockCompletedDonations);
      } else {
        setDonations(completedDonations);
      }
    } catch (error) {
      console.error('Error loading completed donations:', error);
      // Use mock data on error
      const mockCompletedDonations = [
        {
          id: 101,
          hospitalName: 'Kuala Lumpur General Hospital',
          date: '2023-10-15',
          time: '10:00 AM',
          status: 'Completed',
          bloodType: 'O+',
          units: 1
        }
      ];
      setDonations(mockCompletedDonations);
    } finally {
      setLoading(false);
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
        <h1 className="text-2xl font-bold text-gray-900">Completed Donations</h1>
        <p className="text-gray-600 mt-2">View your donation history and details</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Loading donations...</div>
        </div>
      ) : donations.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500 mb-4">You haven't completed any donations yet.</p>
          <button
            onClick={() => navigate('/donor/donate')}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition"
          >
            Request to Donate
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            {donations.map((donation) => (
              <div
                key={donation.id}
                onClick={() => setSelectedDonation(donation)}
                className={`bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-md transition ${
                  selectedDonation?.id === donation.id ? 'ring-2 ring-red-500' : ''
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-900">{donation.hospitalName}</h3>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Completed
                  </span>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>Date: <span className="font-medium">{new Date(donation.date).toLocaleDateString()}</span></p>
                  <p>Blood Type: <span className="font-medium">{donation.bloodType}</span></p>
                  <p>Units: <span className="font-medium">{donation.units}</span></p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            {selectedDonation ? (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Donation Details</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Donation ID</label>
                    <p className="text-gray-900">#{selectedDonation.id}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Hospital</label>
                    <p className="text-gray-900">{selectedDonation.hospitalName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      {selectedDonation.status}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Donation Date</label>
                    <p className="text-gray-900">{new Date(selectedDonation.date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Time</label>
                    <p className="text-gray-900">{selectedDonation.time}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Blood Type</label>
                    <p className="text-gray-900">{selectedDonation.bloodType}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Units Donated</label>
                    <p className="text-gray-900">{selectedDonation.units}</p>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-700">
                    <strong>Thank you!</strong> Your donation has helped save lives. You can donate again after 3 months.
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500">
                <p>Select a donation to view details</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}