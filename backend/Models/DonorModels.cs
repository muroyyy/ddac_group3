using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BloodLine.Models;

[Table("donor_profiles")]
public class DonorProfile
{
    [Key]
    [Column("donor_id")]
    public int Id { get; set; }
    
    [Column("user_id")]
    public int UserId { get; set; }
    
    [Required]
    [Column("blood_type")]
    public string BloodType { get; set; } = string.Empty;
    
    [Required]
    [Column("location")]
    public string Location { get; set; } = string.Empty;
    
    [Column("is_available")]
    public bool IsAvailable { get; set; } = true;
    
    [Column("last_donation_date")]
    public DateTime? LastDonationDate { get; set; }
    
    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

[Table("donation_requests")]
public class DonationRequest
{
    [Key]
    [Column("request_id")]
    public int Id { get; set; }
    
    [Column("donor_id")]
    public int DonorId { get; set; }
    
    [Column("hospital_id")]
    public int? HospitalId { get; set; }
    
    [Required]
    [Column("blood_type")]
    public string BloodType { get; set; } = string.Empty;
    
    [Column("units_requested")]
    public int UnitsRequested { get; set; } = 1;
    
    [Column("status")]
    public string Status { get; set; } = "Pending";
    
    [Column("notes")]
    public string? Notes { get; set; }
    
    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    [Column("updated_at")]
    public DateTime? UpdatedAt { get; set; }
}

[Table("donation_history")]
public class DonationHistory
{
    [Key]
    [Column("donation_id")]
    public int Id { get; set; }
    
    [Column("donor_id")]
    public int DonorId { get; set; }
    
    [Column("hospital_id")]
    public int? HospitalId { get; set; }
    
    [Column("hospital_name")]
    public string HospitalName { get; set; } = string.Empty;
    
    [Column("blood_type")]
    public string BloodType { get; set; } = string.Empty;
    
    [Column("units_donated")]
    public int UnitsDonated { get; set; }
    
    [Column("donation_date")]
    public DateTime DonationDate { get; set; } = DateTime.UtcNow;
    
    [Column("status")]
    public string Status { get; set; } = "Completed";
}

public class CreateDonationRequestDto
{
    [Required]
    public string BloodType { get; set; } = string.Empty;
    
    public int UnitsRequested { get; set; } = 1;
    
    public string? Notes { get; set; }
}

public class UpdateProfileDto
{
    [Required]
    public string BloodType { get; set; } = string.Empty;
    
    [Required]
    public string Location { get; set; } = string.Empty;
    
    public bool IsAvailable { get; set; } = true;
}
