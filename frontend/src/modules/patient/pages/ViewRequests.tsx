import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, FileText } from "lucide-react";

interface Request {
  id: string;
  bloodType: string;
  units: number;
  status: "Pending" | "Approved" | "Rejected" | "Fulfilled";
  hospital: string;
  createdDate: string;
  appointmentDetails?: {
    hospital: string;
    doctor: string;
    date: string;
    time: string;
    location: string;
  };
}

const mockRequests: Request[] = [
  {
    id: "BR-2024-001",
    bloodType: "A+",
    units: 2,
    status: "Approved",
    hospital: "City General Hospital",
    createdDate: "March 10, 2025",
    appointmentDetails: {
      hospital: "City General Hospital",
      doctor: "Dr. Sarah Johnson",
      date: "March 20, 2025",
      time: "10:00 AM",
      location: "Building A, Room 304",
    },
  },
  {
    id: "BR-2024-002",
    bloodType: "O+",
    units: 1,
    status: "Pending",
    hospital: "Mercy Medical Center",
    createdDate: "March 14, 2025",
  },
  {
    id: "BR-2024-003",
    bloodType: "B+",
    units: 3,
    status: "Fulfilled",
    hospital: "Saint Mary's Hospital",
    createdDate: "February 28, 2025",
  },
  {
    id: "BR-2024-004",
    bloodType: "A+",
    units: 2,
    status: "Rejected",
    hospital: "Central Hospital",
    createdDate: "March 5, 2025",
  },
];

export default function ViewRequests() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-500";
      case "Approved":
        return "bg-green-500";
      case "Rejected":
        return "bg-red-500";
      case "Fulfilled":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="mb-2 text-3xl font-bold text-foreground">View Requests</h1>
        <p className="text-muted-foreground">
          Track your blood request history and status
        </p>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <CardTitle>Request History</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Request ID</TableHead>
                  <TableHead>Blood Type</TableHead>
                  <TableHead>Units</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Hospital</TableHead>
                  <TableHead>Created Date</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockRequests.map((request) => (
                  <>
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">{request.id}</TableCell>
                      <TableCell>{request.bloodType}</TableCell>
                      <TableCell>{request.units}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(request.status)}>
                          {request.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{request.hospital}</TableCell>
                      <TableCell>{request.createdDate}</TableCell>
                      <TableCell>
                        {request.status === "Approved" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleExpand(request.id)}
                          >
                            {expandedId === request.id ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                    {expandedId === request.id && request.appointmentDetails && (
                      <TableRow>
                        <TableCell colSpan={7} className="bg-muted/50">
                          <div className="space-y-2 p-4">
                            <h4 className="font-semibold">Appointment Details</h4>
                            <div className="grid gap-2 text-sm md:grid-cols-2">
                              <div>
                                <span className="font-medium">Hospital:</span>{" "}
                                {request.appointmentDetails.hospital}
                              </div>
                              <div>
                                <span className="font-medium">Doctor:</span>{" "}
                                {request.appointmentDetails.doctor}
                              </div>
                              <div>
                                <span className="font-medium">Date:</span>{" "}
                                {request.appointmentDetails.date}
                              </div>
                              <div>
                                <span className="font-medium">Time:</span>{" "}
                                {request.appointmentDetails.time}
                              </div>
                              <div className="md:col-span-2">
                                <span className="font-medium">Location:</span>{" "}
                                {request.appointmentDetails.location}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
