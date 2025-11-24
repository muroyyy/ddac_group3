import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Bell, CheckCheck, Trash2 } from "lucide-react";

interface Notification {
  id: string;
  type: string;
  message: string;
  date: string;
  isRead: boolean;
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "Request Update",
    message: "Your blood request #BR-2024-001 has been approved by City General Hospital",
    date: "March 15, 2025 - 2:30 PM",
    isRead: false,
  },
  {
    id: "2",
    type: "Appointment Reminder",
    message: "Reminder: You have an appointment tomorrow at 10:00 AM with Dr. Sarah Johnson",
    date: "March 15, 2025 - 9:00 AM",
    isRead: false,
  },
  {
    id: "3",
    type: "Profile Update",
    message: "Your profile information was successfully updated",
    date: "March 14, 2025 - 4:15 PM",
    isRead: true,
  },
  {
    id: "4",
    type: "Request Update",
    message: "Your blood request #BR-2024-002 is currently pending review",
    date: "March 14, 2025 - 11:20 AM",
    isRead: true,
  },
  {
    id: "5",
    type: "System",
    message: "Welcome to BloodLine Patient Portal! Complete your profile to get started",
    date: "March 10, 2025 - 8:00 AM",
    isRead: true,
  },
];

export default function Notifications() {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-foreground">Notifications</h1>
          <p className="text-muted-foreground">
            Stay updated with your blood requests and appointments
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <CheckCheck className="mr-2 h-4 w-4" />
            Mark all as read
          </Button>
          <Button variant="outline">
            <Trash2 className="mr-2 h-4 w-4" />
            Clear notifications
          </Button>
        </div>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <CardTitle>All Notifications</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`rounded-lg border border-border p-4 transition-colors ${
                  !notification.isRead ? "bg-muted/50" : "bg-card"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{notification.type}</Badge>
                      {!notification.isRead && (
                        <Badge className="bg-primary">New</Badge>
                      )}
                    </div>
                    <p className="text-sm text-card-foreground">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {notification.date}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
