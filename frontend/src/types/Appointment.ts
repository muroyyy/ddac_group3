export interface Appointment {
  appointmentId: number;
  doctorName: string;
  location: string;
  appointmentDate: string;
  status: "Upcoming" | "Completed" | "Cancelled";
}
