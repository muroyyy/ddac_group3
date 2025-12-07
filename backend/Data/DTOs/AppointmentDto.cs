namespace BloodLine.DTOs
{
    public class AppointmentDto
    {
        public int AppointmentId { get; set; }
        public string DoctorName { get; set; } = "";
        public string Location { get; set; } = "";
        public string AppointmentDate { get; set; } = "";
        public string Status { get; set; } = "";
    }
}
