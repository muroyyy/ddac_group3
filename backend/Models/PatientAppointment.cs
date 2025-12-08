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

    [Column("doctor_name")]
    public string DoctorName { get; set; } = string.Empty;

    [Column("appointment_date")]
    public DateTime AppointmentDate { get; set; }

    [Column("location")]
    public string Location { get; set; } = string.Empty;

    [Column("status")]
    public string Status { get; set; } = string.Empty;

    [Column("doctor_notes")]
    public string? DoctorNotes { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }
}
