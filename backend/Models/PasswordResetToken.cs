using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BloodLine.Models;

[Table("password_reset_tokens")]
public class PasswordResetToken
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Required]
    [Column("user_id")]
    public int UserId { get; set; }

    [Required]
    [StringLength(100)]
    [Column("email")]
    public string Email { get; set; } = string.Empty;

    [Required]
    [StringLength(255)]
    [Column("token")]
    public string Token { get; set; } = string.Empty;

    [Required]
    [Column("expires_at")]
    public DateTime ExpiresAt { get; set; }

    [Column("used")]
    public bool Used { get; set; } = false;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation property
    [ForeignKey("UserId")]
    public virtual User User { get; set; } = null!;
}