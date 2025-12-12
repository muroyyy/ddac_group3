export interface Appointment {
  appointmentId: number;
  doctorName: string;
  hospitalName?: string;
  location?: string;
  appointmentDate: string;
  status: "Upcoming" | "Completed" | "Cancelled";
  doctorNotes?: string;
}
