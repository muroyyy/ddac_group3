using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BloodLine.Models;

public class User
{
    [Column("user_id")]
    public int Id { get; set; }
    
    [Required]
    [StringLength(100)]
    [Column("full_name")]
    public string FullName { get; set; } = string.Empty;
    
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;
    
    [Required]
    public string? Phone { get; set; }
    
    [Required]
    [Column("password_hash")]
    public string PasswordHash { get; set; } = string.Empty;
    
    [Required]
    public UserRole Role { get; set; }
    
    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public UserStatus Status { get; set; } = UserStatus.Active;
}

public enum UserRole
{
    Donor = 1,
    Patient = 2,
    Hospital = 3,
    Admin = 4
}

public enum UserStatus
{
    Active = 1,
    Suspended = 2
}