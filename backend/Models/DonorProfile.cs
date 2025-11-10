using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BloodLine.Models;

public class DonorProfile
{
    [Key]
    [Column("donor_id")]
    public int DonorId { get; set; }
    
    [Required]
    [Column("user_id")]
    public int UserId { get; set; }
    
    [Required]
    [StringLength(5)]
    [Column("blood_type")]
    public string BloodType { get; set; } = string.Empty;
    
    [StringLength(100)]
    public string? Location { get; set; }
    
    [Column("total_donations")]
    public int TotalDonations { get; set; } = 0;
    
    // Navigation property
    public User User { get; set; } = null!;
}