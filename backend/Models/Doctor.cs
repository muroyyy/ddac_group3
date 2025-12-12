using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BloodLine.Models;

[Table("doctors")]
public class Doctor
{
    [Key]
    [Column("doctor_id")]
    public int DoctorId { get; set; }

    [Column("hospital_id")]
    public int HospitalId { get; set; }

    [Column("doctor_name")]
    public string DoctorName { get; set; } = string.Empty;

    [Column("specialization")]
    public string Specialization { get; set; } = string.Empty;

    [Column("contact_number")]
    public string ContactNumber { get; set; } = string.Empty;

    // Navigation properties
    public Hospital Hospital { get; set; } = null!;
}