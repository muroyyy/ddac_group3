using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BloodLine.Models
{
    public class BloodRequest
    {
        [Key]
        [Column("request_id")]
        public int RequestId { get; set; }
        [Column("patient_id")]
        public int PatientId { get; set; }

        [Column("hospital_id")]
        public int HospitalId { get; set; }

        [Column("blood_type", TypeName = "varchar(5)")]
        [StringLength(5)]
        public string BloodType { get; set; } = string.Empty;

        [Column("units_required")]
        public int UnitsRequired { get; set; }

        // Stored in DB as enum-like string; EF mapping configured in ApplicationDbContext
        [Column("status")]
        public string Status { get; set; } = "Pending";

        // Stored in DB as enum-like string; EF mapping configured in ApplicationDbContext
        [Column("urgency_level")]
        public string UrgencyLevel { get; set; } = "Low";

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
