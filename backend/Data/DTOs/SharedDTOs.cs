using System;

namespace BloodLine.Data.DTOs
{
    public class HospitalDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = "";
        public string Location { get; set; } = "";
        public string Phone { get; set; } = "";
    }

    public class DonationRequestDto
    {
        public int Id { get; set; }
        public string Status { get; set; } = "";
        public string BloodType { get; set; } = "";
        public int UnitsRequested { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public string HospitalName { get; set; } = "";
        public string Notes { get; set; } = "";
    }

    public class CreateDonationRequestDto
    {
        public string BloodType { get; set; } = "";
        public int UnitsRequested { get; set; }
        public string? Notes { get; set; }
        public int HospitalId { get; set; }
    }

    public class AppointmentDto
    {
        public int Id { get; set; }
        public string HospitalName { get; set; } = "";
        public DateTime Date { get; set; }
        public TimeSpan Time { get; set; }
        public string Status { get; set; } = "";
        public string BloodType { get; set; } = "";
        public int Units { get; set; }
    }

    public class CompletedDonationDto
    {
        public int Id { get; set; }
        public int DonationId { get; set; }
        public string HospitalName { get; set; } = "";
        public DateTime Date { get; set; }
        public TimeSpan Time { get; set; }
        public string BloodType { get; set; } = "";
        public int Units { get; set; }
        public string Status { get; set; } = "";
    }
}