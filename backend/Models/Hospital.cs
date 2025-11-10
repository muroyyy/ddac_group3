using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BloodLine.Models;

public class Hospital
{
    [Key]
    [Column("hospital_id")]
    public int HospitalId { get; set; }
    
    [Required]
    [Column("user_id")]
    public int UserId { get; set; }
    
    [Required]
    [StringLength(150)]
    [Column("hospital_name")]
    public string HospitalName { get; set; } = string.Empty;
    
    [Required]
    [StringLength(255)]
    public string Address { get; set; } = string.Empty;
    
    [StringLength(100)]
    [Column("contact_person")]
    public string? ContactPerson { get; set; }
    
    [StringLength(15)]
    [Column("contact_number")]
    public string? ContactNumber { get; set; }
    
    // Navigation property
    public User User { get; set; } = null!;
}