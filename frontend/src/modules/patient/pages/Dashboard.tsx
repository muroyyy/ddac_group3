
import { useState, useEffect } from "react";    //acts like a temporary memory, fetches data when page loads or a variable changes
import { useNavigate } from "react-router-dom";         //navigation between pages
import { useAuth } from "../../../context/AuthContext";   //user logged-in info 
import { patientAPI } from '../../../api';   //connected to the backend 
import { Calendar, HeartPulse, ListChecks, CheckCircle } from "lucide-react";

// -----------------------------------------------------------------------------
// 📌 Import images from /src/assets
// Since this file is located in:
//    src/modules/patient/pages/PatientDashboard.tsx
// We must navigate OUT twice: ../../
// -----------------------------------------------------------------------------
import bloodMattersImg from "../../../assets/blood_matteers.png";
import bloodTransfusionImg from "../../../assets/blood_transfusion.png";
import bloodTypeImg from "../../../assets/blood_type.png";


// -----------------------------------------------------------------------------
// 📌 Patient News (Static Mock Data)
// These articles come from real websites (WHO, Red Cross, CDC).
// Each item has an image, description, and link.
// -----------------------------------------------------------------------------
const patientNews = [
  {
    id: 1,
    title: "WHO: Why Blood Donation Matters",
    desc: "Learn insights from the World Health Organization about global blood donation needs.",
    date: "March 2025",
    img: bloodMattersImg,
    url: "https://www.chaudharyhospital.in/why-blood-donation-matters-save-life-and-improve-health/",
  },
  {
    id: 2,
    title: "Red Cross – What Happens During Blood Donation?",
    desc: "Understand the step-by-step process when donating blood.",
    date: "March 2025",
    img: bloodTransfusionImg,
    url: "https://medicalcity.ksu.edu.sa/en/sites/bloodbank/pages/about-blood-donation",
  },
  {
    id: 3,
    title: "CDC: Blood Safety Overview",
    desc: "CDC guidelines on safe blood transfusions and best practices.",
    date: "March 2025",
    img: bloodTypeImg,
    url: "https://cdn.who.int/media/docs/default-source/blood-transfusion-safety/guidelines-and-principles-for-safe-blood-transfudion-practice.pdf?sfvrsn=f249f9a_1",
  },
];

//describes components used in this page 
export default function PatientDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [expandedId, setExpandedId] = useState<number | null>(null); //checks if any UI cards are expanded
  const [stats, setStats] = useState({ pending: 0, upcoming: 0, completed: 0 });
  const [loading, setLoading] = useState(true); //Tracks whether data is still being fetched

  //If a user logs in or changes → dashboard reloads
  useEffect(() => {
    const loadDashboard = async () => {
      if (!user?.id) return;
      try {
        const result = await patientAPI.getDashboard(user.id);
        if (result.success) {
          setStats(result.data);
        }
      } catch (err) {
        console.error("Error loading dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, [user]);

  // ---------------------------------------------------------------------------
  // 📌 Toggle news item expansion (open/close)
  // ---------------------------------------------------------------------------
  const toggleExpand = (id: number) => {
    setExpandedId(prev => (prev === id ? null : id));
  };


  if (loading) return <div className="p-6">Loading dashboard...</div>;

  return (
    <div className="space-y-8">

      {/* ---------------------------------------------------------------------
         HEADER SECTION 
         --------------------------------------------------------------------- */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.name || "Patient"}!
        </h1>
        <p className="text-gray-600 mt-1">
          Here's an overview of your blood transfusion journey.
        </p>
      </div>

      {/* ---------------------------------------------------------------------
         STAT CARDS 
         --------------------------------------------------------------------- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Pending Requests */}
        <div onClick={() => navigate('/patient/view-requests?filter=Pending')} className="bg-white rounded-lg shadow p-6 border hover:shadow-md transition cursor-pointer">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">Pending Requests</p>
            <HeartPulse className="w-5 h-5 text-red-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mt-2">
            {stats.pending}
          </h2>
        </div>

        {/* Upcoming Appointments */}
        <div onClick={() => navigate('/patient/appointments')} className="bg-white rounded-lg shadow p-6 border hover:shadow-md transition cursor-pointer">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">Upcoming Appointments</p>
            <Calendar className="w-5 h-5 text-red-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mt-2">
            {stats.upcoming}
          </h2>
        </div>

        {/* Completed Transfusions */}
        <div onClick={() => navigate('/patient/view-requests?filter=Fulfilled')} className="bg-white rounded-lg shadow p-6 border hover:shadow-md transition cursor-pointer">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">Completed Transfusions</p>
            <CheckCircle className="w-5 h-5 text-red-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mt-2">
            {stats.completed}
          </h2>
        </div>

      </div>


      {/* ---------------------------------------------------------------------
         NEWS HEADER
         --------------------------------------------------------------------- */}
      <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
        <ListChecks className="w-5 h-5 text-red-600" />
        Patient News
      </h2>


      {/* ---------------------------------------------------------------------
         PATIENT NEWS SECTION
         --------------------------------------------------------------------- */}
      <div className="space-y-6">

        {patientNews.map((news) => {
          const isPDF = news.url.toLowerCase().endsWith(".pdf");

          return (
            <div
              key={news.id}
              className="bg-white shadow rounded-lg border hover:shadow-md transition overflow-hidden"
            >

              {/* TOP PART — IMAGE + TEXT */}
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

                  <span className="text-red-600 text-sm mt-2 inline-block hover:underline cursor-pointer">
                    {expandedId === news.id ? "Hide Article ▲" : "Read Article ▼"}
                  </span>
                </div>
              </div>


              {/* -----------------------------------------------------------------
                 EXPANDED CONTENT — EMBED OR PDF LINK
                 ----------------------------------------------------------------- */}
              {expandedId === news.id && (
                <div className="bg-gray-50 border-t p-3">

                  {/* PDF cannot be embedded → show download/open link */}
                  {isPDF ? (
                    <a
                      href={news.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-red-600 underline font-medium cursor-pointer"
                    >
                      Open PDF – Click here
                    </a>
                  ) : (
                    <iframe //embeds webpage within the current pag 
                      src={news.url}
                      className="w-full h-96 rounded border"
                      title={`Article-${news.id}`}
                    ></iframe>
                  )}

                </div>
              )}

            </div>
          );
        })}

      </div>
    </div>
  );
}
