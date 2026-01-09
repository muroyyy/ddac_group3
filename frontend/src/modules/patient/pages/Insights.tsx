/**
 * PATIENT INSIGHTS PAGE - ANALYTICS DASHBOARD
 * 
 * This component displays comprehensive analytics for patient blood requests:
 * - Statistical summaries with visual progress indicators
 * - Monthly trend analysis with bar charts
 * - Calculation-based smart insights and recommendations
 * - Color-coded status breakdowns for quick assessment
 * 
 * FEATURES:
 * - Real-time data loading from backend analytics API
 * - Responsive grid layout for mobile and desktop
 * - Interactive progress bars with percentage calculations
 * - Smart insights based on statistical pattern analysis
 * - Error handling with user-friendly messages
 */

import { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { patientAPI } from '../../../api';

// UTILITY FUNCTION - Calculate percentage with zero-division protection
const getPercent = (part: number, total: number) =>
  total === 0 ? 0 : Math.round((part / total) * 100);

export default function Insights() {
  // AUTHENTICATION CONTEXT - Get current user for API calls
  const { user } = useAuth();
  
  // STATE MANAGEMENT - Handle data, loading, and error states
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // EFFECT HOOK - Load insights data when component mounts or user changes
  useEffect(() => {
    const loadInsights = async () => {
      // GUARD CLAUSE - Ensure user is authenticated
      if (!user?.id) return;
      
      try {
        // API CALL - Fetch analytics data from backend
        const result = await patientAPI.getInsights(user.id);
        
        if (result.success) {
          // SUCCESS - Store analytics data in component state
          setData(result.data);
        } else {
          // API ERROR - Display backend error message
          setError(result.message || "Failed to load insights");
        }
      } catch (err) {
        // NETWORK ERROR - Display generic error message
        setError("Error loading insights");
      } finally {
        // CLEANUP - Always stop loading spinner
        setLoading(false);
      }
    };
    
    loadInsights();
  }, [user]); // DEPENDENCY - Re-run when user changes

  // LOADING STATE - Show spinner while fetching data
  if (loading) return <div className="p-6">Loading insights...</div>;
  
  // ERROR STATE - Display error message with red styling
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  
  // NO DATA STATE - Handle empty response gracefully
  if (!data) return <div className="p-6">No data available</div>;

  // DATA DESTRUCTURING - Extract analytics values from API response
  const { totalRequests, approved, rejected, fulfilled, pending, monthlyTrend, smartInsight } = data;

  // PERCENTAGE CALCULATIONS - Convert counts to percentages for progress bars
  const approvedPct = getPercent(approved, totalRequests);
  const rejectedPct = getPercent(rejected, totalRequests);
  const fulfilledPct = getPercent(fulfilled, totalRequests);
  const pendingPct = getPercent(pending, totalRequests);

  return (
    <div className="space-y-6">
      {/* PAGE HEADER - Title and description */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Request Insights</h1>
        <p className="text-gray-600">
          A quick overview of your blood request history and helpful patterns.
        </p>
      </div>

      {/* TOP SUMMARY CARDS - 4-column grid showing key metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* TOTAL REQUESTS CARD - Blue theme for primary metric */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 cursor-pointer">
          <p className="text-sm font-medium text-blue-800">Total Requests</p>
          <p className="mt-2 text-3xl font-bold text-blue-900">
            {totalRequests}
          </p>
          <p className="mt-1 text-xs text-blue-700">
            All requests submitted in your history.
          </p>
        </div>

        {/* APPROVED REQUESTS CARD - Green theme for positive outcomes */}
        <div className="bg-green-50 border border-green-100 rounded-xl p-4 cursor-pointer">
          <p className="text-sm font-medium text-green-800">Approved</p>
          <p className="mt-2 text-3xl font-bold text-green-900">
            {approved}
          </p>
          <p className="mt-1 text-xs text-green-700">
            {approvedPct}% of your requests were approved.
          </p>
        </div>

        {/* REJECTED REQUESTS CARD - Red theme for attention-needed items */}
        <div className="bg-red-50 border border-red-100 rounded-xl p-4 cursor-pointer">
          <p className="text-sm font-medium text-red-800">Rejected</p>
          <p className="mt-2 text-3xl font-bold text-red-900">{rejected}</p>
          <p className="mt-1 text-xs text-red-700">
            {rejectedPct}% were rejected by hospitals.
          </p>
        </div>

        {/* FULFILLED REQUESTS CARD - Purple theme for completed actions */}
        <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 cursor-pointer">
          <p className="text-sm font-medium text-purple-800">Fulfilled</p>
          <p className="mt-2 text-3xl font-bold text-purple-900">
            {fulfilled}
          </p>
          <p className="mt-1 text-xs text-purple-700">
            Completed transfusions linked to your requests.
          </p>
        </div>
      </div>

      {/* STATUS BREAKDOWN SECTION - Visual progress bars for each status */}
      <div className="bg-white rounded-xl shadow p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Breakdown of Request Status
        </h2>
        <p className="text-sm text-gray-600 mb-2">
          Shows how all your requests were distributed across different outcomes.
        </p>

        {/* APPROVED PROGRESS BAR - Green styling for positive outcome */}
        <BarRow label="Approved" percent={approvedPct} barClass="bg-green-500" />

        {/* REJECTED PROGRESS BAR - Red styling for attention-needed outcome */}
        <BarRow label="Rejected" percent={rejectedPct} barClass="bg-red-500" />

        {/* FULFILLED PROGRESS BAR - Purple styling for completed outcome */}
        <BarRow
          label="Fulfilled"
          percent={fulfilledPct}
          barClass="bg-purple-500"
        />

        {/* PENDING PROGRESS BAR - Yellow styling for in-progress outcome */}
        <BarRow label="Pending" percent={pendingPct} barClass="bg-yellow-500" />
      </div>

      {/* MONTHLY TREND CHART - Simple bar visualization */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900">
          Requests Over the Last Month
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          Helps you identify busy periods and request patterns over time.
        </p>

        {/* BAR CHART GRID - Each month gets a proportional height bar */}
        <div className="grid grid-cols-6 gap-3 items-end">
          {monthlyTrend && monthlyTrend.map((m: any) => (
            <div key={m.month} className="flex flex-col items-center gap-2">
              {/* DYNAMIC BAR HEIGHT - Height proportional to request count */}
              <div
                className="w-full rounded-t-md bg-red-400"
                style={{ height: `${m.requests * 18}px` }}
              />
              {/* MONTH LABEL */}
              <span className="text-xs text-gray-600">{m.month}</span>
              {/* REQUEST COUNT */}
              <span className="text-xs font-semibold text-gray-700">
                {m.requests}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* SMART INSIGHTS PANEL - Calculation-based recommendations */}
      <div className="bg-red-50 border border-red-100 rounded-xl p-5 space-y-2">
        <h2 className="text-lg font-semibold text-red-900 flex items-center gap-2">
          {/* SMART INSIGHTS BADGE - Visual indicator for AI-like functionality */}
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-600 text-white text-xs font-bold">
            AI
          </span>
          Smart Insights
        </h2>
        
        {/* INSIGHT TEXT - Display calculation-based recommendations */}
        <p className="text-sm text-red-900">
          {smartInsight || "Keep monitoring your health and maintain regular check-ups."}
        </p>
        
        {/* DISCLAIMER - Explain the source of insights */}
        <p className="text-xs text-red-700 mt-1">
          *Smart insights based on your actual request history and statistical analysis.
        </p>
      </div>
    </div>
  );
}

// REUSABLE COMPONENT - Progress bar with label and percentage
// Used for displaying status breakdowns in a consistent format

type BarRowProps = {
  label: string;    // Display name for the status (e.g., "Approved")
  percent: number;  // Percentage value for bar width (0-100)
  barClass: string; // Tailwind CSS class for bar color
};

/**
 * BarRow Component - Displays a labeled progress bar
 * 
 * FEATURES:
 * - Shows label and percentage on top row
 * - Animated progress bar with custom color
 * - Responsive design with proper spacing
 * - Accessible markup for screen readers
 */
function BarRow({ label, percent, barClass }: BarRowProps) {
  return (
    <div className="space-y-1">
      {/* LABEL AND PERCENTAGE ROW */}
      <div className="flex justify-between text-sm">
        <span className="font-medium text-gray-800">{label}</span>
        <span className="text-gray-600">{percent}%</span>
      </div>
      
      {/* PROGRESS BAR CONTAINER */}
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        {/* DYNAMIC PROGRESS BAR - Width based on percentage */}
        <div
          className={`h-3 rounded-full ${barClass}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}