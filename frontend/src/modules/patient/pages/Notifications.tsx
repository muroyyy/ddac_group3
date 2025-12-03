import { Bell, CheckCircle, Clock, XCircle, Info } from "lucide-react";

// ⭐ Modernized notification UI
export default function Notifications() {
  
  // ---------------- MOCK DATA ----------------
  const mockNotifications = [
    {
      id: 1,
      message: "Your blood request has been approved.",
      status: "Approved",
      date: "2025-02-18 10:00 AM",
    },
    {
      id: 2,
      message: "Your request is still being reviewed.",
      status: "Pending",
      date: "2025-02-17 4:30 PM",
    },
    {
      id: 3,
      message: "Your previous request has been fulfilled.",
      status: "Fulfilled",
      date: "2025-02-10 9:15 AM",
    },
    {
      id: 4,
      message: "Your blood request was rejected. Contact hospital for details.",
      status: "Rejected",
      date: "2025-02-08 3:00 PM",
    },
  ];

  // ⭐ Assign icon + color per status
  const statusStyles: any = {
    Approved: {
      icon: CheckCircle,
      border: "border-green-500",
      bg: "bg-green-50",
      text: "text-green-700",
    },
    Pending: {
      icon: Clock,
      border: "border-yellow-500",
      bg: "bg-yellow-50",
      text: "text-yellow-700",
    },
    Fulfilled: {
      icon: Info,
      border: "border-blue-500",
      bg: "bg-blue-50",
      text: "text-blue-700",
    },
    Rejected: {
      icon: XCircle,
      border: "border-red-500",
      bg: "bg-red-50",
      text: "text-red-700",
    },
  };

  return (
    <div className="space-y-6">
      
      {/* PAGE HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Bell className="w-6 h-6 text-red-600" />
          Notifications
        </h1>
        <p className="text-gray-600">
          Stay updated with your request status.
        </p>
      </div>

      {/* NOTIFICATION CARDS */}
      <div className="space-y-4">
        {mockNotifications.map((n) => {
          const Style = statusStyles[n.status];
          const Icon = Style.icon;

          return (
            <div
              key={n.id}
              className={`flex items-start justify-between border-l-4 ${Style.border} 
              rounded-lg p-4 shadow-sm ${Style.bg}`}
            >
              {/* LEFT SIDE CONTENT */}
              <div className="flex gap-3 items-start">
                
                {/* Status Icon */}
                <Icon className={`w-6 h-6 ${Style.text}`} />

                {/* Text */}
                <div>
                  <p className="font-medium text-gray-900">{n.message}</p>
                  <p className="text-sm mt-1">
                    <span className={`font-semibold ${Style.text}`}>
                      Status: {n.status}
                    </span>
                  </p>
                </div>
              </div>

              {/* TIMESTAMP */}
              <div className="text-sm text-gray-600 whitespace-nowrap">
                {n.date}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
