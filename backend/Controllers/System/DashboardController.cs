using BloodLine.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BloodLine.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DashboardController : ControllerBase
    {
        private readonly ApplicationDbContext _db;

        public DashboardController(ApplicationDbContext db)
        {
            _db = db;
        }

        [HttpGet("patient/{userId}")]
        public async Task<IActionResult> GetPatientDashboard(int userId)
        {
            try
            {
                var patientProfile = await _db.PatientProfiles
                    .FirstOrDefaultAsync(p => p.UserId == userId);

                if (patientProfile == null)
                    return NotFound(new { success = false, message = "Patient not found." });

                // Pending blood requests
                var pendingRequests = await _db.BloodRequests
                    .Where(r => r.PatientId == patientProfile.PatientId && r.Status == "Pending")
                    .CountAsync();

                // Upcoming appointments (status = "Upcoming")
                var upcomingAppointments = await _db.PatientAppointments
                    .Where(a => a.PatientId == patientProfile.PatientId && a.Status == "Upcoming")
                    .CountAsync();

                // Completed transfusions (status = "Completed")
                var completedTransfusions = await _db.PatientAppointments
                    .Where(a => a.PatientId == patientProfile.PatientId && a.Status == "Completed")
                    .CountAsync();

                return Ok(new
                {
                    success = true,
                    data = new
                    {
                        pending = pendingRequests,
                        upcoming = upcomingAppointments,
                        completed = completedTransfusions
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = "Error loading dashboard data.",
                    error = ex.Message
                });
            }
        }
    }
}
