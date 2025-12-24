using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using BloodLine.Models.Users;
using BloodLine.Models.Hospital;

namespace BloodLine.Models.Blood;

[Table("donation_requests")]
public class DonationRequest
{
    [Key]
    [Column("donation_id")]
    public int DonationId { get; set; }

    [Column("donor_id")]
    public int DonorId { get; set; }

    [Column("hospital_id")]
    public int HospitalId { get; set; }

    [Column("status")]
    public string Status { get; set; } = "Pending";

    [Column("requested_date")]
    public DateTime RequestedDate { get; set; }

    [Column("donation_date")]
    public DateTime? DonationDate { get; set; }

    [Column("units_required")]
    public int UnitsRequired { get; set; }

    // Navigation properties
    public Users.DonorProfile Donor { get; set; } = null!;
    public HospitalEntity Hospital { get; set; } = null!;
}