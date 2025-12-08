using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BloodLine.Models;

public class PatientProfile
{
    [Key]
    [Column("patient_id")]
    public int PatientId { get; set; }

    [Required]
    [Column("user_id")]
    public int UserId { get; set; }

    [Required]
    [StringLength(5)]
    [Column("blood_type_needed")]
    public string BloodTypeNeeded { get; set; } = string.Empty;

    [StringLength(255)]
    [Column("condition_description")]
    public string? ConditionDescription { get; set; }

    [StringLength(255)]
    [Column("medical_condition")]
    public string? MedicalCondition { get; set; }

    [Column("date_of_birth")]
    public DateTime? DateOfBirth { get; set; }

    [StringLength(255)]
    [Column("address")]
    public string? Address { get; set; }

    [StringLength(15)]
    [Column("emergency_contact")]
    public string? EmergencyContact { get; set; }

    [StringLength(255)]
    [Column("allergies")]
    public string? Allergies { get; set; }

    [Required]
    [Column("urgency_level")]
    public UrgencyLevel UrgencyLevel { get; set; }

    public User User { get; set; } = null!;
}

public enum UrgencyLevel
{
    Low = 1,
    Medium = 2,
    High = 3,
    Critical = 4
}
