using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BloodLine.Models;

[Table("active_blood_requests")]
public class ActiveBloodRequest
{
    [Column("request_id")]
    public int RequestId { get; set; }

    [Column("patient_name")]
    public string PatientName { get; set; } = string.Empty;

    [Column("patient_email")]
    public string PatientEmail { get; set; } = string.Empty;

    [Column("blood_type")]
    public string BloodType { get; set; } = string.Empty;

    [Column("units_required")]
    public int UnitsRequired { get; set; }

    [Column("urgency_level")]
    public string UrgencyLevel { get; set; } = string.Empty;

    [Column("status")]
    public string Status { get; set; } = "Pending";

    [Column("hospital_name")]
    public string HospitalName { get; set; } = string.Empty;

    [Column("created_at")]
    public DateTime? CreatedAt { get; set; }
}