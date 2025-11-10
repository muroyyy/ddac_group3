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
    
    [Required]
    [Column("urgency_level")]
    public UrgencyLevel UrgencyLevel { get; set; }
    
    // Navigation property
    public User User { get; set; } = null!;
}

public enum UrgencyLevel
{
    Low = 1,
    Medium = 2,
    High = 3,
    Critical = 4
}