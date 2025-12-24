using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using BloodLine.Models.Users;

namespace BloodLine.Models.Hospital;

[Table("hospital_staff")]
public class HospitalStaff
{
    [Key]
    [Column("staff_id")]
    public int StaffId { get; set; }

    [Column("user_id")]
    public int UserId { get; set; }

    [Column("hospital_id")]
    public int HospitalId { get; set; }

    [Column("position")]
    public string Position { get; set; } = string.Empty;

    [Column("verification_code_used")]
    public string? VerificationCodeUsed { get; set; }

    // Navigation properties
    public Users.User User { get; set; } = null!;
    public HospitalEntity Hospital { get; set; } = null!;
}