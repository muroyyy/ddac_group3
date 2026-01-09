/**
 * PATIENT INSIGHTS/ANALYTICS PAGE - FRONTEND COMPONENT
 * 
 * This React component displays analytics and statistics about a patient's
 * blood request history including:
 * - Summary statistics (total, approved, rejected, fulfilled, pending)
 * - Visual progress bars showing status breakdowns
 * - Monthly trend chart
 * - AI-generated insights and recommendations
 * 
 * DATA VISUALIZATION:
 * - Uses percentage calculations for progress bars
 * - Simple bar chart for monthly trends
 * - Color-coded cards for different metrics
 * - Responsive grid layout for mobile/desktop
 */

// React hooks for component state and lifecycle management
import { useEffect, useState } from "react";
// Authentication context to get current logged-in user
import { useAuth } from "../../../context/AuthContext";
// API service for patient-related backend calls
import { patientAPI } from '../../../api';

/**
 * UTILITY FUNCTION - Calculate percentage with zero division protection
 * 
 * @param part - The numerator value
 * @param total - The denominator value
 * @returns Percentage rounded to nearest integer, 0 if total is 0
 */
const getPercent = (part: number, total: number) =>
  total === 0 ? 0 : Math.round((part / total) * 100);

/**
 * Insights Component - Main analytics dashboard for patients
 * 
 * COMPONENT ARCHITECTURE:
 * - Fetches analytics data from backend on mount
 * - Calculates percentages for visual representation
 * - Renders multiple chart types and summary cards
 * - Displays AI-generated insights
 * - Handles loading, error, and empty states
 */
export default function Insights() {
  // Get authenticated user from context
  const { user } = useAuth();
  
  // STATE MANAGEMENT
  const [data, setData] = useState<any>(null);        // Analytics data from backend
  const [loading, setLoading] = useState(true);       // Loading state for API call
  const [error, setError] = useState("");             // Error message state

  /**
   * DATA LOADING - Fetch analytics data when component mounts
   * 
   * FLOW:
   * 1. Validates user authentication
   * 2. Calls backend API to get insights data
   * 3. Updates component state with received data
   * 4. Handles errors gracefully
   */
  useEffect(() => {
    const loadInsights = async () => {
      // Security check - ensure user is authenticated
      if (!user?.id) return;
      
      try {
        // API CALL - Get analytics data for this patient
        const result = await patientAPI.getInsights(user.id);
        if (result.success) {
          // SUCCESS - Store analytics data
          setData(result.data);
        } else {
          // BACKEND ERROR - Show error message
          setError(result.message || "Failed to load insights");
        }
      } catch (err) {
        // NETWORK ERROR - Handle API call failures
        setError("Error loading insights");
      } finally {
        // Always clear loading state
        setLoading(false);
      }
    };
    
    loadInsights();
  }, [user]);

  // LOADING STATE - Show loading message
  if (loading) return <div className="p-6">Loading insights...</div>;
  // ERROR STATE - Show error message
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  // EMPTY STATE - Show no data message
  if (!data) return <div className="p-6">No data available</div>;

  // DESTRUCTURE DATA - Extract analytics values from backend response
  const { totalRequests, approved, rejected, fulfilled, pending, monthlyTrend, aiInsight } = data;

  // CALCULATE PERCENTAGES - For progress bar visualization
  const approvedPct = getPercent(approved, totalRequests);
  const rejectedPct = getPercent(rejected, totalRequests);
  const fulfilledPct = getPercent(fulfilled, totalRequests);
  const pendingPct = getPercent(pending, totalRequests);

  /**
   * RENDER COMPONENT JSX
   * 
   * STRUCTURE:
   * 1. Page header with title and description
   * 2. Summary cards grid (4 columns on desktop)
   * 3. Status breakdown with progress bars
   * 4. Monthly trend chart
   * 5. AI-generated insights section
   */
  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Request Insights</h1>
        <p className="text-gray-600">
          A quick overview of your blood request history and helpful patterns.
        </p>
      </div>

      {/* SUMMARY CARDS GRID - 4 key metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* TOTAL REQUESTS CARD */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 cursor-pointer">
          <p className="text-sm font-medium text-blue-800">Total Requests</p>
          <p className="mt-2 text-3xl font-bold text-blue-900">
            {totalRequests}
          </p>
          <p className="mt-1 text-xs text-blue-700">
            All requests submitted in your history.
          </p>
        </div>

        {/* APPROVED REQUESTS CARD */}
        <div className="bg-green-50 border border-green-100 rounded-xl p-4 cursor-pointer">
          <p className="text-sm font-medium text-green-800">Approved</p>
          <p className="mt-2 text-3xl font-bold text-green-900">
            {approved}
          </p>
          <p className="mt-1 text-xs text-green-700">
            {approvedPct}% of your requests were approved.
          </p>
        </div>

        {/* REJECTED REQUESTS CARD */}
        <div className="bg-red-50 border border-red-100 rounded-xl p-4 cursor-pointer">
          <p className="text-sm font-medium text-red-800">Rejected</p>
          <p className="mt-2 text-3xl font-bold text-red-900">{rejected}</p>
          <p className="mt-1 text-xs text-red-700">
            {rejectedPct}% were rejected by hospitals.
          </p>
        </div>

        {/* FULFILLED REQUESTS CARD */}
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

      {/* STATUS BREAKDOWN WITH PROGRESS BARS */}
      <div className="bg-white rounded-xl shadow p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Breakdown of Request Status
        </h2>
        <p className="text-sm text-gray-600 mb-2">
          Shows how all your requests were distributed.
        </p>

        {/* PROGRESS BAR ROWS - Visual representation of percentages */}
        <BarRow label="Approved" percent={approvedPct} barClass="bg-green-500" />
        <BarRow label="Rejected" percent={rejectedPct} barClass="bg-red-500" />
        <BarRow label="Fulfilled" percent={fulfilledPct} barClass="bg-purple-500" />
        <BarRow label="Pending" percent={pendingPct} barClass="bg-yellow-500" />
      </div>

      {/* MONTHLY TREND CHART - Simple bar visualization */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900">
          Requests Over the Last Month
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          Helps you see busy periods and patterns.
        </p>

        {/* SIMPLE BAR CHART - Height proportional to request count */}
        <div className="grid grid-cols-6 gap-3 items-end">
          {monthlyTrend && monthlyTrend.map((m: any) => (
            <div key={m.month} className="flex flex-col items-center gap-2">
              {/* BAR HEIGHT - Calculated based on request count */}
              <div
                className="w-full rounded-t-md bg-red-400"
                style={{ height: `${m.requests * 18}px` }}  // Dynamic height
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

      {/* AI INSIGHTS SECTION - Generated by AWS Bedrock Claude AI */}
      <div className="bg-red-50 border border-red-100 rounded-xl p-5 space-y-2">
        <h2 className="text-lg font-semibold text-red-900 flex items-center gap-2">
          {/* AI BADGE - Visual indicator */}
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-600 text-white text-xs font-bold">
            AI
          </span>
          Smart Insights
        </h2>
        {/* AI-GENERATED CONTENT - Personalized recommendations */}
        <p className="text-sm text-red-900">
          {aiInsight}
        </p>
        <p className="text-xs text-red-700 mt-1">
          *AI-powered insights based on your actual request history.
        </p>
      </div>
    </div>
  );
}

/**
 * REUSABLE PROGRESS BAR COMPONENT
 * 
 * Displays a labeled progress bar with percentage
 * Used for visualizing status breakdowns
 * 
 * @param label - Text label for the progress bar
 * @param percent - Percentage value (0-100)
 * @param barClass - CSS class for bar color
 */
type BarRowProps = {
  label: string;
  percent: number;
  barClass: string;
};

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
        {/* PROGRESS BAR FILL - Width based on percentage */}
        <div
          className={`h-3 rounded-full ${barClass}`}
          style={{ width: `${percent}%` }}  // Dynamic width
        />
      </div>
    </div>
  );
}