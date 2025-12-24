using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BloodLine.Models.Hospital;

[Table("hospital")]
public class Hospital
{
    [Key]
    [Column("hospital_id")]
    public int HospitalId { get; set; }

    [Column("user_id")]
    public int UserId { get; set; }

    [Column("hospital_name")]
    public string HospitalName { get; set; } = string.Empty;

    [Column("address")]
    public string Address { get; set; } = string.Empty;

    [Column("contact_person")]
    public string? ContactPerson { get; set; }

    [Column("contact_number")]
    public string? ContactNumber { get; set; }

    public Users.User User { get; set; } = null!;
}