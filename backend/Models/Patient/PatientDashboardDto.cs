namespace BloodLine.Models.Patient
{
    public class PatientDashboardDto
    {
        public int TotalRequests { get; set; }
        public int Pending { get; set; }
        public int Approved { get; set; }
        public int Rejected { get; set; }
        public int Fulfilled { get; set; }
    }
}
