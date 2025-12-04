import React from 'react';

const BloodTable: React.FC = () => {
  const compatibilityData = [
    { type: 'O−', donate: 'All blood types', receive: 'O−' },
    { type: 'O+', donate: 'O+, A+, B+, AB+', receive: 'O+, O−' },
    { type: 'A−', donate: 'A−, A+, AB−, AB+', receive: 'A−, O−' },
    { type: 'A+', donate: 'A+, AB+', receive: 'A+, A−, O+, O−' },
    { type: 'B−', donate: 'B−, B+, AB−, AB+', receive: 'B−, O−' },
    { type: 'B+', donate: 'B+, AB+', receive: 'B+, B−, O+, O−' },
    { type: 'AB−', donate: 'AB−, AB+', receive: 'AB−, A−, B−, O−' },
    { type: 'AB+', donate: 'AB+ only', receive: 'All types' },
  ];

  return (
    <div className="overflow-x-auto rounded-xl shadow-lg border border-red-200 bg-white">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-red-600 text-white text-sm uppercase tracking-wider">
            <th className="p-4 font-semibold rounded-tl-xl">Blood Type</th>
            <th className="p-4 font-semibold">Can Donate To</th>
            <th className="p-4 font-semibold rounded-tr-xl">Can Receive From</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-red-100">
          {compatibilityData.map((row, index) => (
            <tr 
              key={row.type} 
              className={`hover:bg-red-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
            >
              <td className="p-4 font-bold text-red-700 border-r border-red-50">{row.type}</td>
              <td className="p-4 text-gray-700">{row.donate}</td>
              <td className="p-4 text-gray-700">{row.receive}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BloodTable;