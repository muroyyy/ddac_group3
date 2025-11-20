using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BloodLine.Models;

[Table("blood_inventory")]
public class BloodInventory
{
    [Key]
    [Column("inventory_id")]
    public int Id { get; set; }
    
    [Required]
    [Column("blood_type")]
    [StringLength(5)]
    public string BloodType { get; set; } = string.Empty;
    
    [Required]
    [Column("units")]
    public int Units { get; set; }
    
    [Column("hospital_id")]
    public int HospitalId { get; set; }
    
    [Column("last_updated")]
    public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
    
    [Column("status")]
    [StringLength(20)]
    public string Status { get; set; } = "good";
}

[Table("approval_requests")]
public class ApprovalRequest
{
    [Key]
    [Column("request_id")]
    public int Id { get; set; }
    
    [Column("user_id")]
    public int UserId { get; set; }
    
    [Column("request_type")]
    [StringLength(20)]
    public string RequestType { get; set; } = string.Empty;
    
    [Column("status")]
    [StringLength(20)]
    public string Status { get; set; } = "pending";
    
    [Column("blood_type")]
    [StringLength(5)]
    public string? BloodType { get; set; }
    
    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    [Column("reviewed_by")]
    public int? ReviewedBy { get; set; }
    
    [Column("reviewed_at")]
    public DateTime? ReviewedAt { get; set; }
    
    [ForeignKey("UserId")]
    public virtual User User { get; set; } = null!;
}

public class ApprovalUpdateRequest
{
    [Required]
    public string Status { get; set; } = string.Empty;
    
    [Required]
    public int ReviewedBy { get; set; }
}
