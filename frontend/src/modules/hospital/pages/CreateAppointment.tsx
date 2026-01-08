import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, User, ArrowLeft } from 'lucide-react';

export default function CreateAppointment() {
  const navigate = useNavigate();
  const [requestId, setRequestId] = useState<number | null>(null);
  const [patientName, setPatientName] = useState('');
  const [bloodType, setBloodType] = useState('');

  useEffect(() => {
    // Get data from URL params or history state
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('requestId');
    const name = urlParams.get('patientName');
    const type = urlParams.get('bloodType');
    
    if (id && name && type) {
      setRequestId(parseInt(id));
      setPatientName(name);
      setBloodType(type);
    } else if (window.history.state) {
      setRequestId(window.history.state.requestId);
      setPatientName(window.history.state.patientName);
      setBloodType(window.history.state.bloodType);
    }
  }, []);

  const [formData, setFormData] = useState({
    doctorName: '',
    appointmentDate: '',
    appointmentTime: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestId) {
      alert('Invalid request ID');
      return;
    }

    // This component is no longer needed since approval creates appointment directly
    alert('This page is deprecated. Appointments are now created during approval.');
    navigate('/hospital/blood-requests');
  };

  if (!requestId) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p className="text-red-600 mb-4">Invalid request. Please go back to approvals.</p>
          <button
            onClick={() => navigate('/hospital/approvals')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Back to Approvals
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-br from-green-50 via-white to-green-50 min-h-screen">
      <div className="mb-8">
        <button
          onClick={() => navigate('/hospital/approvals')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Approvals
        </button>
        
        <h2 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <Calendar className="w-8 h-8 text-green-600" />
          Create Appointment
        </h2>
        <p className="text-gray-600">Schedule appointment for approved blood request</p>
      </div>

      {/* Patient Info */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Patient Information</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-gray-500" />
            <span className="text-gray-700">Patient: {patientName}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-red-600 text-xs font-bold">B</span>
            </div>
            <span className="text-gray-700">Blood Type: {bloodType}</span>
          </div>
        </div>
      </div>

      {/* Appointment Form */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Doctor Name *
            </label>
            <input
              type="text"
              required
              value={formData.doctorName}
              onChange={(e) => setFormData(prev => ({ ...prev, doctorName: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Enter doctor's name"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Appointment Date *
              </label>
              <input
                type="date"
                required
                value={formData.appointmentDate}
                onChange={(e) => setFormData(prev => ({ ...prev, appointmentDate: e.target.value }))}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Appointment Time *
              </label>
              <input
                type="time"
                required
                value={formData.appointmentTime}
                onChange={(e) => setFormData(prev => ({ ...prev, appointmentTime: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
            >
              Go to Blood Requests
            </button>
            <button
              type="button"
              onClick={() => navigate('/hospital/approvals')}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}