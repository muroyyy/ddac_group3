using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BloodLine.Models;

[Table("blood_requests")]
public class BloodRequest
{
    [Key]
    [Column("request_id")]
    public int RequestId { get; set; }

    [Column("patient_id")]
    public int PatientId { get; set; }

    [Column("hospital_id")]
    public int HospitalId { get; set; }

    [Column("blood_type")]
    public string BloodType { get; set; } = string.Empty;

    [Column("units_required")]
    public int UnitsRequired { get; set; }

    [Column("status")]
    public string Status { get; set; } = "Pending";

    [Column("urgency_level")]
    public string UrgencyLevel { get; set; } = string.Empty;

    [Column("notes")]
    public string? Notes { get; set; }

    [Column("rejection_notes")]
    public string? RejectionNotes { get; set; }

    [Column("created_at")]
    public DateTime? CreatedAt { get; set; }
}