using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BloodLine.Models.Users;

[Table("user_registration_data")]
public class UserRegistrationData
{
    [Key]
    [Column("id")]
    public int Id { get; set; }
    
    [Required]
    [Column("user_id")]
    public int UserId { get; set; }
    
    [Column("blood_type")]
    [StringLength(5)]
    public string? BloodType { get; set; }
    
    [Column("location")]
    [StringLength(200)]
    public string? Location { get; set; }
    
    [Column("hospital_id")]
    public int? HospitalId { get; set; }
    
    [Column("position")]
    [StringLength(100)]
    public string? Position { get; set; }
    
    [Column("verification_code")]
    [StringLength(50)]
    public string? VerificationCode { get; set; }
    
    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation property
    public User User { get; set; } = null!;
}
