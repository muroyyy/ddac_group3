import { useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { Calendar, HeartPulse, ListChecks, CheckCircle } from "lucide-react";

// ---------------- MOCK NEWS ITEMS ----------------
// Each news article embeds a real external webpage.
// "embed" = URL that loads inside an iframe.

const patientNews = [
  {
    id: 1,
    title: "WHO: Why Blood Donation Matters",
    desc: "Learn insights from the World Health Organization about global blood donation needs.",
    date: "March 2025",
    img: "https://www.who.int/images/default-source/health-topics/blood-safety/donor.jpg",
    url: "https://www.who.int/campaigns/world-blood-donor-day",
  },
  {
    id: 2,
    title: "Red Cross – What Happens During Blood Donation?",
    desc: "Understand the step-by-step process when donating blood.",
    date: "March 2025",
    img: "https://www.redcrossblood.org/content/dam/redcrossblood/blood-donor-hero.jpg",
    url: "https://www.redcrossblood.org/donate-blood/blood-donation-process.html",
  },
  {
    id: 3,
    title: "CDC: Blood Safety Overview",
    desc: "CDC guidelines on safe blood transfusions and best practices.",
    date: "March 2025",
    img: "https://www.cdc.gov/blood-safety/images/blood-donation.jpg",
    url: "https://www.cdc.gov/blood-safety/",
  },
];

export default function PatientDashboard() {
  const { user } = useAuth();

  // Track which news article is expanded (shows iframe)
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const stats = {
    pending: 2,
    upcoming: 1,
    completed: 8,
  };

  // Toggle open/close for embedded news iframe
  const toggleExpand = (id: number) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  return (
    <div className="space-y-8">

      {/* ---------------- HEADER ---------------- */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.name || "Patient"}!
        </h1>
        <p className="text-gray-600 mt-1">
          Here's an overview of your blood transfusion journey.
        </p>
      </div>

      {/* ---------------- STAT CARDS ---------------- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <div className="bg-white rounded-lg shadow p-6 border hover:shadow-md transition">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">Pending Requests</p>
            <HeartPulse className="w-5 h-5 text-red-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mt-2">{stats.pending}</h2>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border hover:shadow-md transition">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">Upcoming Appointments</p>
            <Calendar className="w-5 h-5 text-red-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mt-2">{stats.upcoming}</h2>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border hover:shadow-md transition">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">Completed Transfusions</p>
            <CheckCircle className="w-5 h-5 text-red-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mt-2">{stats.completed}</h2>
        </div>

      </div>

      {/* ---------------- NEWS SECTION ---------------- */}
      <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
        <ListChecks className="w-5 h-5 text-red-600" /> Patient News
      </h2>

      <div className="space-y-6">

        {patientNews.map((news) => (
          <div
            key={news.id}
            className="bg-white shadow rounded-lg border hover:shadow-md transition overflow-hidden"
          >
            {/* NEWS CARD TOP: IMAGE + TEXT */}
            <div
              className="flex gap-4 p-4 cursor-pointer"
              onClick={() => toggleExpand(news.id)}
            >
              <img
                src={news.img}
                alt={news.title}
                className="w-28 h-20 object-cover rounded"
              />

              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{news.title}</h3>
                <p className="text-sm text-gray-600">{news.desc}</p>
                <p className="text-xs text-gray-400 mt-1">{news.date}</p>

                <span className="text-red-600 text-sm mt-2 inline-block hover:underline">
                  {expandedId === news.id ? "Hide Article ▲" : "Read Article ▼"}
                </span>
              </div>
            </div>

            {/* ---------------- EMBEDDED ARTICLE ---------------- */}
            {expandedId === news.id && (
              <div className="bg-gray-50 border-t p-3">
                <iframe
                  src={news.url}
                  className="w-full h-96 rounded border"
                  title={`Article-${news.id}`}
                ></iframe>
              </div>
            )}
          </div>
        ))}

      </div>
    </div>
  );
}

