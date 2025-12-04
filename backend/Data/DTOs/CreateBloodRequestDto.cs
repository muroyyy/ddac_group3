namespace BloodLine.DTOs
{
    public class CreateBloodRequestDto
    {
        public string BloodType { get; set; } = string.Empty;
        public int UnitsRequired { get; set; }
        public string UrgencyLevel { get; set; } = string.Empty;
        public int HospitalId { get; set; }
        public string? Notes { get; set; }
    }
}
