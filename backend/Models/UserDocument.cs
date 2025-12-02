using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BloodLine.Models;

public class UserDocument
{
    [Column("document_id")]
    public int Id { get; set; }
    
    [Required]
    [Column("user_id")]
    public int UserId { get; set; }
    
    [Required]
    [StringLength(255)]
    [Column("file_name")]
    public string FileName { get; set; } = string.Empty;
    
    [Required]
    [StringLength(500)]
    [Column("file_path")]
    public string FilePath { get; set; } = string.Empty;
    
    [Required]
    [StringLength(50)]
    [Column("document_type")]
    public string DocumentType { get; set; } = string.Empty; // "ID_CARD", "MEDICAL_CARD", "OTHER"
    
    [Column("uploaded_at")]
    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation property
    public User User { get; set; } = null!;
}

