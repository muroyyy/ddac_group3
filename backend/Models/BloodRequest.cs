using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BloodLine.Models;

public class BloodRequest
{
    [Key]
    [Column("request_id")]
    public int RequestId { get; set; }

    [Column("patient_id")]
    public int PatientId { get; set; }

    [Column("blood_type")]
    public string BloodType { get; set; } = string.Empty;

    [Column("urgency_level")]
    public string UrgencyLevel { get; set; } = string.Empty;

    [Column("request_status")]
    public string RequestStatus { get; set; } = "Pending";

    [Column("requested_at")]
    public DateTime RequestedAt { get; set; } = DateTime.UtcNow;
}
