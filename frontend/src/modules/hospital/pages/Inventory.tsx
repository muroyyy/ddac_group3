import { useEffect, useState } from 'react';
import { Plus, Edit3, Droplet } from 'lucide-react';
import { hospitalAPI } from '../services/hospitalAPI';
import type { BloodInventoryItem } from '../services/hospitalAPI';

export default function Inventory() {
  const hospitalId = 1; // All hospital users use hospital_id 1

  const [items, setItems] = useState<BloodInventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newItem, setNewItem] = useState({ bloodType: '', units: 0 });

  const load = async () => {
    setLoading(true);
    try {
      // Mock data until backend endpoint is deployed
      const mockData: BloodInventoryItem[] = [
        { id: 1, bloodType: 'A+', units: 25, status: 'Good Stock', lastUpdated: new Date().toISOString(), hospitalId: 1 },
        { id: 2, bloodType: 'O-', units: 8, status: 'Low Stock', lastUpdated: new Date().toISOString(), hospitalId: 1 },
        { id: 3, bloodType: 'B+', units: 15, status: 'Good Stock', lastUpdated: new Date().toISOString(), hospitalId: 1 },
        { id: 4, bloodType: 'AB+', units: 3, status: 'Critical', lastUpdated: new Date().toISOString(), hospitalId: 1 },
        { id: 5, bloodType: 'O+', units: 30, status: 'Good Stock', lastUpdated: new Date().toISOString(), hospitalId: 1 }
      ];
      setItems(mockData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hospitalId) load();
  }, [hospitalId]);

  const handleAdd = async () => {
    try {
      // Mock add - just add to local state
      const newId = Math.max(...items.map(i => i.id)) + 1;
      const mockItem: BloodInventoryItem = {
        id: newId,
        bloodType: newItem.bloodType,
        units: newItem.units,
        status: newItem.units > 20 ? 'Good Stock' : newItem.units > 10 ? 'Low Stock' : 'Critical',
        lastUpdated: new Date().toISOString(),
        hospitalId
      };
      setItems([...items, mockItem]);
      setNewItem({ bloodType: '', units: 0 });
      setShowAdd(false);
    } catch (e) {
      console.error(e);
    }
  };



  const handleEditUnits = async (id: number, current: number) => {
    const v = prompt('Enter new units', String(current));
    if (v == null) return;
    const units = parseInt(v, 10);
    if (Number.isNaN(units)) return alert('Invalid number');
    try {
      // Mock update - just update local state
      setItems(items.map(item => 
        item.id === id 
          ? { ...item, units, status: units > 20 ? 'Good Stock' : units > 10 ? 'Low Stock' : 'Critical', lastUpdated: new Date().toISOString() }
          : item
      ));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="p-6 bg-gradient-to-br from-red-50 via-white to-red-50 min-h-screen">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Manage Blood Inventory</h2>
        <p className="text-gray-600">Track and manage blood stock levels</p>
      </div>
      <div className="mb-6">
        <button 
          className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-semibold shadow-lg" 
          onClick={() => setShowAdd(!showAdd)}
        >
          <Plus className="w-5 h-5" />
          {showAdd ? 'Cancel' : 'Add Inventory'}
        </button>
        {showAdd && (
          <div className="mt-4 p-6 bg-white rounded-2xl shadow-xl border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Blood Inventory</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Blood Type</label>
                <select 
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-red-500 focus:border-red-500" 
                  value={newItem.bloodType} 
                  onChange={(e) => setNewItem({ ...newItem, bloodType: e.target.value })}
                >
                  <option value="">Select Blood Type</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Units</label>
                <input 
                  type="number" 
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-red-500 focus:border-red-500" 
                  placeholder="Number of units" 
                  value={String(newItem.units)} 
                  onChange={(e) => setNewItem({ ...newItem, units: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button 
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium" 
                onClick={handleAdd}
              >
                Save Inventory
              </button>
              <button 
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium" 
                onClick={() => setShowAdd(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gradient-to-r from-red-600 to-red-700 text-white">
            <tr>
              <th className="p-4 font-semibold">Blood Type</th>
              <th className="p-4 font-semibold">Units Available</th>
              <th className="p-4 font-semibold">Status</th>
              <th className="p-4 font-semibold">Last Updated</th>
              <th className="p-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="p-6 text-center text-gray-500">Loading inventory...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={5} className="p-6 text-center text-gray-500">No inventory items found</td></tr>
            ) : (
              items.map((item, index) => (
                <tr key={item.id} className={`border-t border-gray-100 hover:bg-blue-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-red-50 bg-opacity-30'}`}>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                        <Droplet className="w-5 h-5 text-red-600" />
                      </div>
                      <span className="font-semibold text-gray-900">{item.bloodType}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-gray-900">{item.units}</span>
                      <span className="text-sm text-gray-600">units</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      item.units > 20 ? 'bg-green-100 text-green-700' :
                      item.units > 10 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {item.units > 20 ? 'Good Stock' : item.units > 10 ? 'Low Stock' : 'Critical'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="text-sm text-gray-600">
                      {new Date(item.lastUpdated).toLocaleDateString()}
                      <div className="text-xs text-gray-500">
                        {new Date(item.lastUpdated).toLocaleTimeString()}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <button 
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium" 
                      onClick={() => handleEditUnits(item.id, item.units)}
                    >
                      <Edit3 className="w-4 h-4" />
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
