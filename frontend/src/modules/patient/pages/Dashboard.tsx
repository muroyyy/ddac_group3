import { useEffect, useState } from "react";
import { PatientService as patientService } from "../patient.service";
import { useAuth } from "../../../context/AuthContext";
import LoadingSpinner from "../../../components/LoadingSpinner";

/**
 * Patient Dashboard Page
 * -----------------------------------------------------
 * Shows:
 *  - Welcome message
 *  - Summary statistics (pending, appointments, completed)
 *  - Patient news cards (static for now)
 */

export default function Dashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const patientId = user?.id ?? null;

  /**
   * Dashboard state
   * -------------------------------
   * This stores the counts returned by GET /dashboard endpoint.
   */
  const [summary, setSummary] = useState({
    totalRequests: 0,
    pending: 0,
    fulfilled: 0,
    upcomingAppointments: 0,
  });

  /**
   * Fetch dashboard data on page load
   */
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!patientId) {
      setError('No authenticated patient found');
      setLoading(false);
      return;
    }

    setLoading(true);
    patientService.getDashboard(patientId)
      .then((data) => {
        if (!data) {
          setError('No data returned from server');
        } else {
          setSummary({
            totalRequests: data.totalRequests || 0,
            pending: data.pending || 0,
            fulfilled: data.fulfilled || 0,
            upcomingAppointments: data.upcomingAppointments || 0,
          });
        }
      })
      .catch((err) => {
        console.error('Error fetching patient dashboard:', err);
        setError(String(err?.message ?? err));
      })
      .finally(() => setLoading(false));
  }, [authLoading, patientId]);

  return (
    <div className="p-6">
      {/* -----------------------------------------------------
          HEADER SECTION 
      ------------------------------------------------------*/}
      <h1 className="text-3xl font-bold text-gray-800 mb-1">
        Welcome back, {user?.name ?? 'patient'}!
      </h1>
      <p className="text-gray-500 mb-8">
        Here's an overview of your blood transfusion journey
      </p>

      {/* -----------------------------------------------------
          STATISTICS CARDS  
          These match your UI screenshot (3 cards)
      ------------------------------------------------------*/}
      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <div className="p-6 bg-yellow-50 rounded-md border border-yellow-100 text-yellow-800">{error}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">

        {/* Pending Requests */}
        <div className="p-6 bg-white shadow rounded-xl border border-gray-100">
          <p className="text-gray-500 text-sm">Pending Blood Requests</p>
          <h2 className="text-3xl font-bold text-red-600">
            {summary.pending}
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Active requests awaiting approval
          </p>
        </div>

        {/* Upcoming Appointments */}
        <div className="p-6 bg-white shadow rounded-xl border border-gray-100">
          <p className="text-gray-500 text-sm">Upcoming Appointments</p>
          <h2 className="text-3xl font-bold text-orange-500">
            {summary.upcomingAppointments}
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Scheduled transfusion sessions
          </p>
        </div>

        {/* Completed Transfusions */}
        <div className="p-6 bg-white shadow rounded-xl border border-gray-100">
          <p className="text-gray-500 text-sm">Completed Transfusions</p>
          <h2 className="text-3xl font-bold text-green-600">
            {summary.fulfilled}
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Total successful transfusions
          </p>
        </div>
        </div>
      )}

      {/* -----------------------------------------------------
          PATIENT NEWS SECTION
          Matches your UI grid of 4 news cards
      ------------------------------------------------------*/}
      <h2 className="text-xl font-semibold mb-4">📰 Patient News</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <NewsCard 
          title="Post-Transfusion Care Tips" 
          date="March 15, 2025"
          description="Learn how to take care of yourself after receiving blood transfusion..."
        />

        <NewsCard 
          title="New Blood Donation Campaign" 
          date="March 12, 2025"
          description="Our hospital is launching a new blood donation drive this month..."
        />

        <NewsCard 
          title="Understanding Blood Types" 
          date="March 10, 2025"
          description="A comprehensive guide to blood types and compatibility..."
        />

        <NewsCard 
          title="Wellness Tips for Patients" 
          date="March 8, 2025"
          description="Maintaining good health while managing your condition..."
        />
      </div>
    </div>
  );
}


/**
 * News Card Component
 * -------------------------------------------------------
 * A reusable UI block for patient news/announcements.
 */
interface NewsCardProps {
  title: string;
  date: string;
  description: string;
}

function NewsCard({ title, date, description }: NewsCardProps) {
  return (
    <div className="p-5 bg-white shadow rounded-xl border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      <p className="text-gray-500 text-sm mt-1">{description}</p>
      <p className="text-gray-400 text-xs mt-3">{date}</p>
    </div>
  );
}

