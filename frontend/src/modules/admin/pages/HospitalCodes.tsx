import React, { useState, useEffect } from 'react';
import { Plus, Key, Building2, Calendar, Users, CheckCircle, XCircle, Copy } from 'lucide-react';
import { hospitalCodeAPI, hospitalAPI } from '../../../api';

interface VerificationCode {
  codeId: number;
  hospitalId: number;
  hospitalName: string;
  verificationCode: string;
  isActive: boolean;
  createdAt: string;
  usedCount: number;
}

interface Hospital {
  hospitalId: number;
  hospitalName: string;
  address: string;
}

const HospitalCodes: React.FC = () => {
  const [codes, setCodes] = useState<VerificationCode[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [selectedHospitalId, setSelectedHospitalId] = useState<number | null>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [codesResponse, hospitalsResponse] = await Promise.all([
        hospitalCodeAPI.getAllCodes(),
        hospitalAPI.getAllHospitals()
      ]);

      if (codesResponse.success) {
        setCodes(codesResponse.data);
      }
      if (hospitalsResponse.success) {
        setHospitals(hospitalsResponse.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCode = async () => {
    if (!selectedHospitalId) return;

    setGenerating(true);
    try {
      const response = await hospitalCodeAPI.generateCode(selectedHospitalId);
      if (response.success) {
        alert(`Verification code generated: ${response.data.verificationCode}`);
        setShowGenerateModal(false);
        setSelectedHospitalId(null);
        fetchData();
      } else {
        alert(response.message || 'Failed to generate code');
      }
    } catch (error) {
      console.error('Error generating code:', error);
      alert('Error generating code');
    } finally {
      setGenerating(false);
    }
  };

  const handleDeactivateCode = async (codeId: number) => {
    if (!confirm('Are you sure you want to deactivate this code?')) return;

    try {
      const response = await hospitalCodeAPI.deactivateCode(codeId);
      if (response.success) {
        alert('Code deactivated successfully');
        fetchData();
      }
    } catch (error) {
      console.error('Error deactivating code:', error);
      alert('Error deactivating code');
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    alert('Code copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hospital Verification Codes</h1>
          <p className="text-gray-600">Manage verification codes for hospital staff registration</p>
        </div>
        <button
          onClick={() => setShowGenerateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Generate Code
        </button>
      </div>

      <div className="grid gap-6">
        {codes.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <Key className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No verification codes yet</h3>
            <p className="text-gray-500">Generate codes for hospitals to onboard their staff</p>
          </div>
        ) : (
          codes.map((code) => (
            <div key={code.codeId} className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{code.hospitalName}</h3>
                    <p className="text-sm text-gray-500">Hospital ID: {code.hospitalId}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                  code.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {code.isActive ? (
                    <span className="flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      Active
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <XCircle className="w-4 h-4" />
                      Inactive
                    </span>
                  )}
                </span>
              </div>

              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <Key className="w-4 h-4 text-gray-500" />
                  <span className="font-mono font-semibold text-gray-900">{code.verificationCode}</span>
                  <button
                    onClick={() => copyToClipboard(code.verificationCode)}
                    className="text-red-600 hover:text-red-700"
                    title="Copy code"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  Created: {new Date(code.createdAt).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="w-4 h-4" />
                  Used by {code.usedCount} staff member{code.usedCount !== 1 ? 's' : ''}
                </div>
              </div>

              {code.isActive && (
                <div className="flex gap-3">
                  <button
                    onClick={() => handleDeactivateCode(code.codeId)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                  >
                    Deactivate Code
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Generate Code Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Generate Verification Code</h3>
            <p className="text-sm text-gray-600 mb-4">
              Select a hospital to generate a verification code for staff registration
            </p>
            <select
              value={selectedHospitalId || ''}
              onChange={(e) => setSelectedHospitalId(parseInt(e.target.value) || null)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent mb-4"
            >
              <option value="">Select a hospital</option>
              {hospitals.map((hospital) => (
                <option key={hospital.hospitalId} value={hospital.hospitalId}>
                  {hospital.hospitalName}
                </option>
              ))}
            </select>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowGenerateModal(false);
                  setSelectedHospitalId(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateCode}
                disabled={!selectedHospitalId || generating}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generating ? 'Generating...' : 'Generate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HospitalCodes;
