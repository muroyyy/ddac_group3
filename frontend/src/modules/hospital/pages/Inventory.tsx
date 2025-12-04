import { useEffect, useState } from 'react';
import { hospitalAPI } from '../services/hospitalAPI';
import type { BloodInventoryItem } from '../services/hospitalAPI';
import { useAuth } from '../../../context/AuthContext';

export default function Inventory() {
  const { user } = useAuth();
  const hospitalId = user?.id || 0;

  const [items, setItems] = useState<BloodInventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newItem, setNewItem] = useState({ bloodType: '', units: 0 });

  const load = async () => {
    setLoading(true);
    try {
      const res = await hospitalAPI.getBloodInventory(hospitalId);
      setItems(res);
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
      await hospitalAPI.addBloodInventory({ ...newItem, hospitalId });
      setNewItem({ bloodType: '', units: 0 });
      setShowAdd(false);
      load();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this inventory item?')) return;
    try {
      await hospitalAPI.deleteBloodInventory(id);
      load();
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
      await hospitalAPI.updateBloodInventory(id, { units });
      load();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Manage Blood Inventory</h2>
      <div className="mb-4">
        <button className="px-4 py-2 bg-red-600 text-white rounded" onClick={() => setShowAdd(!showAdd)}>
          {showAdd ? 'Cancel' : 'Add Inventory'}
        </button>
        {showAdd && (
          <div className="mt-3 p-4 bg-white rounded shadow">
            <div className="grid grid-cols-2 gap-3">
              <input className="border p-2" placeholder="Blood Type" value={newItem.bloodType} onChange={(e) => setNewItem({ ...newItem, bloodType: e.target.value })} />
              <input type="number" className="border p-2" placeholder="Units" value={String(newItem.units)} onChange={(e) => setNewItem({ ...newItem, units: Number(e.target.value) })} />
            </div>
            <div className="mt-3">
              <button className="px-4 py-2 bg-green-600 text-white rounded" onClick={handleAdd}>Save</button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded shadow overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3">Blood Type</th>
              <th className="p-3">Units</th>
              <th className="p-3">Status</th>
              <th className="p-3">Last Updated</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="p-4">Loading...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={5} className="p-4">No inventory</td></tr>
            ) : (
              items.map(item => (
                <tr key={item.id} className="border-t">
                  <td className="p-3 text-red-600">{item.bloodType}</td>
                  <td className="p-3 text-red-600">{item.units}</td>
                  <td className="p-3 text-red-600">{item.status}</td>
                  <td className="p-3 text-red-600">{new Date(item.lastUpdated).toLocaleString()}</td>
                  <td className="p-3">
                    <button className="mr-2 text-blue-600" onClick={() => handleEditUnits(item.id, item.units)}>Edit</button>
                    <button className="text-red-600" onClick={() => handleDelete(item.id)}>Delete</button>
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
