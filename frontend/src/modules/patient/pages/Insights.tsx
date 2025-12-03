import { useState } from "react";

// This page gives the patient an overview of their request history.
// Example insights: total requests, approval rate, fulfillment stats, etc.
// Everything is MOCK right now — later you will fetch real data from backend.

export default function Insights() {
  
  // ---------------- MOCK INSIGHTS DATA --------------------
  // This mimics what an API response WOULD look like later.
  // We hardcode the values so the frontend layout can be built first.

  const [insights] = useState({
    totalRequests: 12,
    approved: 6,
    rejected: 3,
    fulfilled: 2,
    pending: 1,
  });

  // Converts the number into a percentage for bar-chart width.
  // Example: approved = 6 out of 12 => 50%
  const getPercentage = (value: number) => {
    if (insights.totalRequests === 0) return "0%";
    return `${(value / insights.totalRequests) * 100}%`;
  };


  // ========================== UI ==============================

  return (
    <div className="max-w-3xl bg-white p-6 rounded-lg shadow space-y-8">

      {/* HEADER SECTION */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Request Insights</h1>
        <p className="text-gray-600 text-sm mt-2">
          An overview of your blood request activity and outcomes.
        </p>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        
        {/* Total Requests */}
        <div className="p-5 bg-blue-100 border-l-4 border-blue-500 rounded">
          <h3 className="text-blue-900 font-semibold">Total Requests</h3>
          <p className="text-3xl font-bold mt-2">{insights.totalRequests}</p>
        </div>

        {/* Approved */}
        <div className="p-5 bg-green-100 border-l-4 border-green-500 rounded">
          <h3 className="text-green-900 font-semibold">Approved</h3>
          <p className="text-3xl font-bold mt-2">{insights.approved}</p>
        </div>

        {/* Rejected */}
        <div className="p-5 bg-red-100 border-l-4 border-red-500 rounded">
          <h3 className="text-red-900 font-semibold">Rejected</h3>
          <p className="text-3xl font-bold mt-2">{insights.rejected}</p>
        </div>

        {/* Fulfilled */}
        <div className="p-5 bg-purple-100 border-l-4 border-purple-500 rounded">
          <h3 className="text-purple-900 font-semibold">Fulfilled</h3>
          <p className="text-3xl font-bold mt-2">{insights.fulfilled}</p>
        </div>
      </div>


      {/* MINI BAR CHARTS */}
      <div className="space-y-6 mt-10">

        {/* SECTION TITLE */}
        <h2 className="text-xl font-semibold text-gray-800">
          Breakdown of Request Status
        </h2>

        {/* Approved Bar */}
        <div>
          <p className="font-medium text-gray-700">Approved</p>
          <div className="h-4 bg-gray-200 rounded mt-2">
            {/* The filled bar */}
            <div
              className="h-full bg-green-500 rounded"
              style={{ width: getPercentage(insights.approved) }}
            />
          </div>
        </div>

        {/* Rejected Bar */}
        <div>
          <p className="font-medium text-gray-700">Rejected</p>
          <div className="h-4 bg-gray-200 rounded mt-2">
            <div
              className="h-full bg-red-500 rounded"
              style={{ width: getPercentage(insights.rejected) }}
            />
          </div>
        </div>

        {/* Fulfilled Bar */}
        <div>
          <p className="font-medium text-gray-700">Fulfilled</p>
          <div className="h-4 bg-gray-200 rounded mt-2">
            <div
              className="h-full bg-purple-500 rounded"
              style={{ width: getPercentage(insights.fulfilled) }}
            />
          </div>
        </div>

        {/* Pending Bar */}
        <div>
          <p className="font-medium text-gray-700">Pending</p>
          <div className="h-4 bg-gray-200 rounded mt-2">
            <div
              className="h-full bg-yellow-500 rounded"
              style={{ width: getPercentage(insights.pending) }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

