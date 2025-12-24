using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BloodLine.Models.Hospital;

[Table("hospital_verification_codes")]
public class HospitalVerificationCode
{
    [Key]
    [Column("code_id")]
    public int CodeId { get; set; }

    [Column("hospital_id")]
    public int HospitalId { get; set; }

    [Column("verification_code")]
    [MaxLength(12)]
    public string VerificationCode { get; set; } = string.Empty;

    [Column("is_active")]
    public bool IsActive { get; set; } = true;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation property
    public Hospital.Hospital Hospital { get; set; } = null!;
}
