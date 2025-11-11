using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BloodLine.Models;

[Table("analytics_log")]
public class AnalyticsLog
{
    [Key]
    [Column("log_id")]
    public int LogId { get; set; }
    
    [Required]
    [StringLength(100)]
    [Column("action_type")]
    public string ActionType { get; set; } = string.Empty;
    
    [Column("performed_by")]
    public int? PerformedBy { get; set; }
    
    [Column("timestamp")]
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    
    [ForeignKey("PerformedBy")]
    public User? User { get; set; }
}
