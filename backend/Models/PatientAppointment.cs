public class PatientAppointment
{
    public int AppointmentId { get; set; }
    public int RequestId { get; set; }
    public int PatientId { get; set; }
    public int HospitalId { get; set; }

    public string DoctorName { get; set; }
    public DateTime AppointmentDate { get; set; }
    public string Location { get; set; }
    public string Status { get; set; }

    public DateTime CreatedAt { get; set; }
}
