using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BloodLine.Models;

[Table("patient_appointments")]
public class PatientAppointment
{
    [Key]
    [Column("appointment_id")]
    public int AppointmentId { get; set; }

    [Column("request_id")]
    public int RequestId { get; set; }

    [Column("patient_id")]
    public int PatientId { get; set; }

    [Column("hospital_id")]
    public int HospitalId { get; set; }

    [Column("doctor_id")]
    public int? DoctorId { get; set; }

    [Column("appointment_date")]
    public DateTime AppointmentDate { get; set; }

    [Column("status")]
    public string Status { get; set; } = "Upcoming";

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("doctor_notes")]
    public string? DoctorNotes { get; set; }
}