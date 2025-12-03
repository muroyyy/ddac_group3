// src/modules/patient/pages/Insights.tsx

// This page shows "Request Insights" for the patient.
// RIGHT NOW: everything is mock + frontend-only.
// LATER: you will replace the mock with a real API call
// that reads from your database and (optionally) an AWS AI service.

import React from "react";

// ------------------ MOCK DATA SECTION ----------------------
// In the future, you will fetch this from your backend:
// GET /api/patient/{id}/insights

const mockStats = {
  totalRequests: 12,
  approved: 6,
  rejected: 3,
  fulfilled: 2,
  pending: 1,
  // average time from request → approved (hours)
  avgApprovalTimeHours: 18,
  // How often the patient usually makes requests (days between)
  avgDaysBetweenRequests: 30,
};

// Fake trend data for last 6 months
const mockMonthlyTrend = [
  { month: "Sep", requests: 1 },
  { month: "Oct", requests: 2 },
  { month: "Nov", requests: 3 },
  { month: "Dec", requests: 2 },
  { month: "Jan", requests: 2 },
  { month: "Feb", requests: 2 },
];

// ------------------ SIMPLE HELPERS -------------------------

// Helper to calculate a percentage safely.
const getPercent = (part: number, total: number) =>
  total === 0 ? 0 : Math.round((part / total) * 100);

export default function Insights() {
  const { totalRequests, approved, rejected, fulfilled, pending } = mockStats;

  const approvedPct = getPercent(approved, totalRequests);
  const rejectedPct = getPercent(rejected, totalRequests);
  const fulfilledPct = getPercent(fulfilled, totalRequests);
  const pendingPct = getPercent(pending, totalRequests);

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Request Insights</h1>
        <p className="text-gray-600">
          A quick overview of your blood request history and helpful patterns.
        </p>
      </div>

      {/* TOP SUMMARY CARDS (4) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Requests */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
          <p className="text-sm font-medium text-blue-800">Total Requests</p>
          <p className="mt-2 text-3xl font-bold text-blue-900">
            {totalRequests}
          </p>
          <p className="mt-1 text-xs text-blue-700">
            All requests submitted in your history.
          </p>
        </div>

        {/* Approved */}
        <div className="bg-green-50 border border-green-100 rounded-xl p-4">
          <p className="text-sm font-medium text-green-800">Approved</p>
          <p className="mt-2 text-3xl font-bold text-green-900">
            {approved}
          </p>
          <p className="mt-1 text-xs text-green-700">
            {approvedPct}% of your requests were approved.
          </p>
        </div>

        {/* Rejected */}
        <div className="bg-red-50 border border-red-100 rounded-xl p-4">
          <p className="text-sm font-medium text-red-800">Rejected</p>
          <p className="mt-2 text-3xl font-bold text-red-900">{rejected}</p>
          <p className="mt-1 text-xs text-red-700">
            {rejectedPct}% were rejected by hospitals.
          </p>
        </div>

        {/* Fulfilled */}
        <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
          <p className="text-sm font-medium text-purple-800">Fulfilled</p>
          <p className="mt-2 text-3xl font-bold text-purple-900">
            {fulfilled}
          </p>
          <p className="mt-1 text-xs text-purple-700">
            Completed transfusions linked to your requests.
          </p>
        </div>
      </div>

      {/* BREAKDOWN BARS – same idea as your screenshot but cleaner */}
      <div className="bg-white rounded-xl shadow p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Breakdown of Request Status
        </h2>
        <p className="text-sm text-gray-600 mb-2">
          Shows how all your requests were distributed.
        </p>

        {/* Approved bar */}
        <BarRow label="Approved" percent={approvedPct} barClass="bg-green-500" />

        {/* Rejected bar */}
        <BarRow label="Rejected" percent={rejectedPct} barClass="bg-red-500" />

        {/* Fulfilled bar */}
        <BarRow
          label="Fulfilled"
          percent={fulfilledPct}
          barClass="bg-purple-500"
        />

        {/* Pending bar */}
        <BarRow label="Pending" percent={pendingPct} barClass="bg-yellow-500" />
      </div>

      {/* MONTHLY TREND (very simple bar chart) */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900">
          Requests Over the Last 6 Months
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          Helps you see busy periods and patterns.
        </p>

        <div className="grid grid-cols-6 gap-3 items-end">
          {mockMonthlyTrend.map((m) => (
            <div key={m.month} className="flex flex-col items-center gap-2">
              {/* Bar height is proportional to number of requests */}
              <div
                className="w-full rounded-t-md bg-red-400"
                style={{ height: `${m.requests * 18}px` }}
              />
              <span className="text-xs text-gray-600">{m.month}</span>
              <span className="text-xs font-semibold text-gray-700">
                {m.requests}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* “AI” STYLE SUMMARY (MOCKED FOR NOW) */}
      <div className="bg-red-50 border border-red-100 rounded-xl p-5 space-y-2">
        <h2 className="text-lg font-semibold text-red-900 flex items-center gap-2">
          {/* Simple fake AI badge */}
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-600 text-white text-xs font-bold">
            AI
          </span>
          Smart Insight (Mock)
        </h2>
        <p className="text-sm text-red-900">
          Based on your request history, most of your requests are{" "}
          <strong>approved within about {mockStats.avgApprovalTimeHours} hours</strong>.
          You typically submit a new request every{" "}
          <strong>{mockStats.avgDaysBetweenRequests} days</strong>. Try to plan
          future requests at least <strong>2–3 days in advance</strong> to give
          hospitals enough time to prepare blood safely.
        </p>
        <p className="text-xs text-red-700 mt-1">
          *In the future, this paragraph can be generated by an AWS Bedrock
          model using your real data.
        </p>
      </div>
    </div>
  );
}

// ----------------- SMALL REUSABLE COMPONENT -------------------
// Displays a single “label + progress bar + percentage” row.

type BarRowProps = {
  label: string;
  percent: number;
  barClass: string;
};

function BarRow({ label, percent, barClass }: BarRowProps) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="font-medium text-gray-800">{label}</span>
        <span className="text-gray-600">{percent}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className={`h-3 rounded-full ${barClass}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
