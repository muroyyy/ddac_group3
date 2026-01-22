/**
 * PATIENT INSIGHTS PAGE
 *
 * This page shows the patient a summary of their blood request history.
 * It includes totals, percentages, trends, and simple insights.
 */

import { useEffect, useState } from "react";
// Used to store data and run code when the page loads

import { useAuth } from "../../../context/AuthContext";
// Used to know which patient is logged in

import { patientAPI } from '../../../api';
// Used to fetch analytics data from the backend


// Helper function to calculate percentage safely
// Prevents division by zero errors
const getPercent = (part: number, total: number) =>
  total === 0 ? 0 : Math.round((part / total) * 100);

export default function Insights() {

  // Get the currently logged-in patient
  const { user } = useAuth();

  // Stores analytics data returned from backend
  const [data, setData] = useState<any>(null);

  // Used to show loading message while data is fetching
  const [loading, setLoading] = useState(true);

  // Used to show error message if something fails
  const [error, setError] = useState("");

  // Runs automatically when the page loads
  useEffect(() => {

    // Function to load analytics data
    const loadInsights = async () => {

      // Stop if user is not logged in
      if (!user?.id) return;

      try {
        // Request analytics data from backend
        const result = await patientAPI.getInsights(user.id);

        if (result.success) {
          // Save analytics data into state
          setData(result.data);
        } else {
          // Show backend error message
          setError(result.message || "Failed to load insights");
        }

      } catch (err) {
        // Show error if request fails
        setError("Error loading insights");

      } finally {
        // Stop showing loading message
        setLoading(false);
      }
    };

    // Call function when page opens
    loadInsights();

  }, [user]); // Re-run if logged-in user changes


  // Show loading text while fetching data
  if (loading) return <div className="p-6">Loading insights...</div>;

  // Show error message if something goes wrong
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  // Show message if no data is returned
  if (!data) return <div className="p-6">No data available</div>;

  // Extract values from backend response
  const {
    totalRequests,
    approved,
    rejected,
    fulfilled,
    pending,
    monthlyTrend,
    smartInsight
  } = data;

  // Convert numbers into percentages for progress bars
  const approvedPct = getPercent(approved, totalRequests);
  const rejectedPct = getPercent(rejected, totalRequests);
  const fulfilledPct = getPercent(fulfilled, totalRequests);
  const pendingPct = getPercent(pending, totalRequests);

  return (
    <div className="space-y-6">

      {/* PAGE TITLE */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Request Insights</h1>
        <p className="text-gray-600">
          Overview of your blood request history and patterns.
        </p>
      </div>

      {/* SUMMARY CARDS */}
      {/* Shows total, approved, rejected, and fulfilled requests */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

        {/* TOTAL REQUESTS */}
        <div className="bg-blue-50 border rounded-xl p-4">
          <p className="text-sm text-blue-800">Total Requests</p>
          <p className="text-3xl font-bold text-blue-900">{totalRequests}</p>
        </div>

        {/* APPROVED REQUESTS */}
        <div className="bg-green-50 border rounded-xl p-4">
          <p className="text-sm text-green-800">Approved</p>
          <p className="text-3xl font-bold text-green-900">{approved}</p>
          <p className="text-xs text-green-700">{approvedPct}% approved</p>
        </div>

        {/* REJECTED REQUESTS */}
        <div className="bg-red-50 border rounded-xl p-4">
          <p className="text-sm text-red-800">Rejected</p>
          <p className="text-3xl font-bold text-red-900">{rejected}</p>
          <p className="text-xs text-red-700">{rejectedPct}% rejected</p>
        </div>

        {/* FULFILLED REQUESTS */}
        <div className="bg-purple-50 border rounded-xl p-4">
          <p className="text-sm text-purple-800">Fulfilled</p>
          <p className="text-3xl font-bold text-purple-900">{fulfilled}</p>
        </div>
      </div>

      {/* STATUS BREAKDOWN */}
      {/* Visual progress bars showing request status distribution */}
      <div className="bg-white rounded-xl shadow p-6 space-y-4">
        <h2 className="text-lg font-semibold">Request Status Breakdown</h2>

        <BarRow label="Approved" percent={approvedPct} barClass="bg-green-500" />
        <BarRow label="Rejected" percent={rejectedPct} barClass="bg-red-500" />
        <BarRow label="Fulfilled" percent={fulfilledPct} barClass="bg-purple-500" />
        <BarRow label="Pending" percent={pendingPct} barClass="bg-yellow-500" />
      </div>

      {/* MONTHLY TREND */}
      {/* Shows how many requests were made each month */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold">Monthly Request Trend</h2>

        <div className="grid grid-cols-6 gap-3 items-end">
          {monthlyTrend.map((m: any) => (
            <div key={m.month} className="flex flex-col items-center">
              {/* Bar height depends on request count */}
              <div
                className="w-full bg-red-400 rounded-t-md"
                style={{ height: `${m.requests * 18}px` }}
              />
              <span className="text-xs">{m.month}</span>
              <span className="text-xs font-semibold">{m.requests}</span>
            </div>
          ))}
        </div>
      </div>

      {/* SMART INSIGHTS */}
      {/* Simple calculated insight based on request history */}
      <div className="bg-red-50 border rounded-xl p-5">
        <h2 className="text-lg font-semibold text-red-900">Smart Insight</h2>
        <p className="text-sm text-red-900">
          {smartInsight || "Keep monitoring your health regularly."}
        </p>
      </div>
    </div>
  );
}


// REUSABLE PROGRESS BAR COMPONENT
// Used to display percentages visually

type BarRowProps = {
  label: string;    // Name of status
  percent: number;  // Percentage value
  barClass: string; // Color of the bar
};

function BarRow({ label, percent, barClass }: BarRowProps) {
  return (
    <div className="space-y-1">

      {/* Label and percentage */}
      <div className="flex justify-between text-sm">
        <span>{label}</span>
        <span>{percent}%</span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div
          className={`h-3 rounded-full ${barClass}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
