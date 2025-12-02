namespace BloodLine.Models
{
    public class BloodRequest
    {
        public int RequestId { get; set; }
        public int PatientId { get; set; }
        public int HospitalId { get; set; }
        public string BloodType { get; set; } = string.Empty;
        public int UnitsRequired { get; set; }
        public string Status { get; set; } = "Pending";  
        public string UrgencyLevel { get; set; } = "Low";
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
