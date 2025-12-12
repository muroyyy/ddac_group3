using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BloodLine.Models;

[Table("donor_appointments")]
public class DonorAppointment
{
    [Key]
    [Column("appointment_id")]
    public int AppointmentId { get; set; }

    [Column("donor_id")]
    public int DonorId { get; set; }

    [Column("donation_id")]
    public int DonationId { get; set; }

    [Column("hospital_id")]
    public int HospitalId { get; set; }

    [Column("appointment_date")]
    public DateTime AppointmentDate { get; set; }

    [Column("appointment_time")]
    public TimeSpan AppointmentTime { get; set; }

    [Column("status")]
    public string Status { get; set; } = "Upcoming";

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public DonorProfile Donor { get; set; } = null!;
    public DonationRequest DonationRequest { get; set; } = null!;
    public Hospital Hospital { get; set; } = null!;
}