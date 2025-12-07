
// ----------------------------------------------------------------------
// GET: api/patient/appointments/{userId}
// Returns ALL appointments for the patient.
// ----------------------------------------------------------------------
[HttpGet("appointments/{userId}")]
public async Task<IActionResult> GetAppointments(int userId)
{
    try
    {
        if (userId <= 0)
        {
            return BadRequest(new { success = false, message = "Valid user ID is required." });
        }

        // Convert user → patientId
        var profile = await _db.PatientProfiles
            .FirstOrDefaultAsync(p => p.UserId == userId);

        if (profile == null)
        {
            return BadRequest(new
            {
                success = false,
                message = "Patient profile not found."
            });
        }

        int patientId = profile.PatientId;

        // Fetch appointments from database
        var appts = await _db.PatientAppointments
            .Where(a => a.PatientId == patientId)
            .OrderByDescending(a => a.AppointmentDate)
            .Select(a => new
            {
                appointmentId = a.AppointmentId,
                doctorName = a.DoctorName,
                location = a.Location,
                appointmentDate = a.AppointmentDate.ToString("yyyy-MM-dd HH:mm"),
                status = a.Status
            })
            .ToListAsync();

        return Ok(new { success = true, data = appts });
    }
    catch (Exception ex)
    {
        Console.WriteLine($"❌ Error loading appointments: {ex.Message}");

        return StatusCode(500, new
        {
            success = false,
            message = "Failed to load appointments.",
            error = ex.Message
        });
    }
}
