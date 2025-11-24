import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Download, Eye } from "lucide-react";

interface Appointment {
  id: string;
  hospital: string;
  doctor: string;
  date: string;
  time: string;
  status: "Upcoming" | "Completed";
  location: string;
}

const mockAppointments: Appointment[] = [
  {
    id: "APT-001",
    hospital: "City General Hospital",
    doctor: "Dr. Sarah Johnson",
    date: "March 20, 2025",
    time: "10:00 AM",
    status: "Upcoming",
    location: "Building A, Room 304",
  },
  {
    id: "APT-002",
    hospital: "Mercy Medical Center",
    doctor: "Dr. Michael Chen",
    date: "February 15, 2025",
    time: "2:30 PM",
    status: "Completed",
    location: "Main Building, 2nd Floor",
  },
  {
    id: "APT-003",
    hospital: "Saint Mary's Hospital",
    doctor: "Dr. Emily Rodriguez",
    date: "January 28, 2025",
    time: "11:00 AM",
    status: "Completed",
    location: "West Wing, Room 205",
  },
];

export default function Appointments() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="mb-2 text-3xl font-bold text-foreground">Appointments</h1>
        <p className="text-muted-foreground">
          Manage your transfusion appointments
        </p>
      </div>

      <div className="space-y-6">
        {/* Upcoming Appointments */}
        <Card className="shadow-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <CardTitle>Upcoming Appointments</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockAppointments
                .filter((apt) => apt.status === "Upcoming")
                .map((appointment) => (
                  <div
                    key={appointment.id}
                    className="rounded-lg border border-border bg-card p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-card-foreground">
                            {appointment.hospital}
                          </h3>
                          <Badge className="bg-green-500">
                            {appointment.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Doctor: {appointment.doctor}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Date & Time: {appointment.date} at {appointment.time}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Location: {appointment.location}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="mr-2 h-4 w-4" />
                          Details
                        </Button>
                        <Button size="sm">
                          <Download className="mr-2 h-4 w-4" />
                          Slip
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Past Appointments */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Past Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockAppointments
                .filter((apt) => apt.status === "Completed")
                .map((appointment) => (
                  <div
                    key={appointment.id}
                    className="rounded-lg border border-border bg-card p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-card-foreground">
                            {appointment.hospital}
                          </h3>
                          <Badge className="bg-blue-500">
                            {appointment.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Doctor: {appointment.doctor}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Date & Time: {appointment.date} at {appointment.time}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Location: {appointment.location}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="mr-2 h-4 w-4" />
                          Details
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
