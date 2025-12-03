

export default function Insights() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Insights</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow"> 
          <h3 className="font-semibold mb-2">Request Trends</h3>
          <p className="text-sm text-gray-600">Mocked visualization placeholder. Replace with charts when ready.</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow"> 
          <h3 className="font-semibold mb-2">Appointment Summary</h3>
          <p className="text-sm text-gray-600">Mocked stats about upcoming and past appointments.</p>
        </div>
      </div>
    </div>
  );
}
