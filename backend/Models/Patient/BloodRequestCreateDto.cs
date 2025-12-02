namespace BloodLine.Models.Patient
{
    public class BloodRequestCreateDto
    {
        public int HospitalId { get; set; }
        public string BloodType { get; set; } = string.Empty;
        public int UnitsRequired { get; set; }
        public string UrgencyLevel { get; set; } = "Low";
        public string? Reason { get; set; }
    }
}

