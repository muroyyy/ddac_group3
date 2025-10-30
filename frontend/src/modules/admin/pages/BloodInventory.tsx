import React, { useState, useEffect } from 'react';
import { Droplet, RefreshCw, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { adminAPI, BloodInventoryItem } from '../services/adminAPI';

const BloodInventory: React.FC = () => {
  const [inventory, setInventory] = useState<BloodInventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadInventory = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getBloodInventory();
      setInventory(data);
    } catch (error) {
      console.error('Failed to load blood inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'good': return 'Good Stock';
      case 'warning': return 'Low Stock';
      case 'critical': return 'Critical Low';
      default: return 'Unknown';
    }
  };

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-800';
      case 'warning': return 'text-yellow-800';
      case 'critical': return 'text-red-800';
      default: return 'text-gray-800';
    }
  };

  const totalUnits = inventory.reduce((sum, item) => sum + item.units, 0);
  const criticalItems = inventory.filter(item => item.status === 'critical').length;
  const warningItems = inventory.filter(item => item.status === 'warning').length;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Blood Inventory</h2>
          <p className="text-sm text-gray-500">Monitor blood stock levels across all types</p>
        </div>
        <button
          onClick={loadInventory}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Units</p>
              <p className="text-3xl font-bold text-gray-900">{totalUnits}</p>
            </div>
            <Droplet className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Critical Alerts</p>
              <p className="text-3xl font-bold text-red-600">{criticalItems}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Low Stock Warnings</p>
              <p className="text-3xl font-bold text-yellow-600">{warningItems}</p>
            </div>
            <TrendingDown className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
      </div>

      {/* Inventory Grid */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Blood Type Inventory</h3>
        </div>
        
        {loading ? (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg">
                  <div className="h-6 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        ) : inventory.length > 0 ? (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {inventory.map((item, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xl font-bold text-gray-900">{item.bloodType}</h4>
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(item.status)}`}></div>
                  </div>
                  
                  <div className="mb-3">
                    <p className="text-3xl font-bold text-gray-900">{item.units}</p>
                    <p className="text-sm text-gray-500">units available</p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-medium ${getStatusTextColor(item.status)}`}>
                      {getStatusText(item.status)}
                    </span>
                    {item.status === 'good' ? (
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-600" />
                    )}
                  </div>
                  
                  {/* Progress bar */}
                  <div className="mt-3">
                    <div className="bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${getStatusColor(item.status)}`}
                        style={{ 
                          width: `${Math.min((item.units / 200) * 100, 100)}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-12 text-center">
            <Droplet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Inventory Data</h3>
            <p className="text-gray-500">Blood inventory data will appear here once available.</p>
          </div>
        )}
      </div>

      {/* Critical Alerts */}
      {inventory.filter(item => item.status === 'critical').length > 0 && (
        <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            <h3 className="text-lg font-semibold text-red-800">Critical Stock Alerts</h3>
          </div>
          <div className="space-y-2">
            {inventory
              .filter(item => item.status === 'critical')
              .map((item, index) => (
                <div key={index} className="flex items-center justify-between bg-white p-3 rounded border border-red-200">
                  <span className="font-medium text-red-800">
                    {item.bloodType} blood type is critically low
                  </span>
                  <span className="text-sm text-red-600">
                    Only {item.units} units remaining
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BloodInventory;