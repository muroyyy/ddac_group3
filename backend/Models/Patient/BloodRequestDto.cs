namespace BloodLine.Models.Patient
{
    public class BloodRequestDto
    {
        public int RequestId { get; set; }
        public int PatientId { get; set; }
        public int HospitalId { get; set; }
        public string BloodType { get; set; } = string.Empty;
        public int UnitsRequired { get; set; }
        public string Status { get; set; } = string.Empty;
        public string UrgencyLevel { get; set; } = string.Empty;
        public string? Reason { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
