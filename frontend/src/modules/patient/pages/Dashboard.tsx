// Import the authentication context so we can read the logged-in user's name
import { useAuth } from "../../../context/AuthContext";

// These TypeScript interfaces describe the shape of our mock data.
// This helps VSCode auto-complete and prevents mistakes.
interface PatientDashboardStats {
  pendingRequests: number;
  upcomingAppointments: number;
  completedTransfusions: number;
}

interface NewsItem {
  id: number;
  title: string;
  excerpt: string;
  date: string;
}

// ---- MOCK DATA (THIS WILL BE REPLACED WITH API DATA LATER) ----

// Statistics you normally get from backend.
// We hardcode them for now so the frontend works without backend.
const mockStats: PatientDashboardStats = {
  pendingRequests: 2,
  upcomingAppointments: 1,
  completedTransfusions: 8,
};

// News / updates for the patient dashboard.
const mockNews: NewsItem[] = [
  {
    id: 1,
    title: "Post-Transfusion Care Tips",
    excerpt: "Learn how to care for yourself after a transfusion...",
    date: "March 15, 2025",
  },
  {
    id: 2,
    title: "Blood Supply Update",
    excerpt: "Hospitals are reporting healthy blood inventory levels...",
    date: "March 10, 2025",
  },
];

// ---- MAIN DASHBOARD COMPONENT ----
export default function Dashboard() {
  // Access currently logged-in user (from login)
  // Example: { name: "Sharveen Patient", email: "..." }
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      
      {/* GREETING HEADER */}
      <h1 className="text-3xl font-bold text-gray-900">
        Welcome back, {user?.name ?? "Patient"}!
      </h1>

      <p className="text-gray-600">
        Here is your transfusion journey overview.
      </p>

      {/* STATISTICS CARDS */}
      {/* This creates 3 boxes side-by-side (Pending, Upcoming, Completed) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* We loop through an array of stats to generate 3 cards automatically */}
        {[
          { label: "Pending Requests", value: mockStats.pendingRequests, color: "text-red-600" },
          { label: "Upcoming Appointments", value: mockStats.upcomingAppointments, color: "text-yellow-600" },
          { label: "Completed Transfusions", value: mockStats.completedTransfusions, color: "text-green-600" },
        ].map((stat, i) => (
          
          // Each box is a card
          <div key={i} className="bg-white p-6 rounded-lg shadow">
            
            {/* Label */}
            <div className="text-sm text-gray-600">{stat.label}</div>

            {/* Value */}
            <div className={`text-3xl font-bold mt-2 ${stat.color}`}>
              {stat.value}
            </div>

          </div>
        ))}

      </div>

      {/* NEWS SECTION */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Patient News</h2>

        {/* Loop through mockNews array and display each item */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {mockNews.map((item) => (
            <div key={item.id} className="border rounded-lg px-4 py-3">
              
              {/* News title */}
              <h3 className="font-semibold">{item.title}</h3>

              {/* Short description */}
              <p className="text-sm text-gray-600 mt-1">{item.excerpt}</p>

              {/* Date published */}
              <p className="text-xs text-gray-400 mt-2">{item.date}</p>

            </div>
          ))}

        </div>
      </div>

    </div>
  );
}


