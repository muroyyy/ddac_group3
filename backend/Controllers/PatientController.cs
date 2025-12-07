using BloodLine.Data;
using BloodLine.DTOs;
using BloodLine.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BloodLine.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PatientController : ControllerBase
    {
        private readonly ApplicationDbContext _db;

        public PatientController(ApplicationDbContext db)
        {
            _db = db;
        }

        // -------------------------------------------------------------------
        // Convert UserId -> PatientId
        // -------------------------------------------------------------------
        private async Task<int?> GetPatientIdFromUser(int userId)
        {
            var profile = await _db.PatientProfiles
                .FirstOrDefaultAsync(p => p.UserId == userId);

            return profile?.PatientId;
        }

        // -------------------------------------------------------------------
        // POST: /api/patient/blood-request/{userId}
        // -------------------------------------------------------------------
        [HttpPost("blood-request/{userId}")]
        public async Task<IActionResult> CreateBloodRequest(int userId, [FromBody] CreateBloodRequestDto dto)
        {
            try
            {
                if (userId <= 0)
                    return BadRequest(new { success = false, message = "Invalid user ID." });

                if (dto == null)
                    return BadRequest(new { success = false, message = "Request data is required." });

                // 🔥 Convert userId → patientId
                var patientId = await GetPatientIdFromUser(userId);

                if (patientId == null)
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = "Patient profile not found for this user."
                    });
                }

                var newRequest = new BloodRequest
                {
                    PatientId = patientId.Value,
                    HospitalId = dto.HospitalId,
                    BloodType = dto.BloodType ?? "Unknown",
                    UnitsRequired = dto.UnitsRequired > 0 ? dto.UnitsRequired : 1,
                    UrgencyLevel = dto.UrgencyLevel ?? "Medium",
                    Notes = dto.Notes,
                    Status = "Pending",
                    CreatedAt = DateTime.UtcNow
                };

                _db.BloodRequests.Add(newRequest);
                await _db.SaveChangesAsync();

                return Ok(new
                {
                    success = true,
                    message = "Blood request created successfully.",
                    requestId = newRequest.RequestId
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = "Error submitting blood request.",
                    error = ex.Message
                });
            }
        }

        // -------------------------------------------------------------------
        // GET: /api/patient/blood-requests/{userId}
        // -------------------------------------------------------------------
        [HttpGet("blood-requests/{userId}")]
        public async Task<IActionResult> GetBloodRequests(int userId)
        {
            try
            {
                if (userId <= 0)
                    return BadRequest(new { success = false, message = "Invalid user ID." });

                // 🔥 Convert userId → patientId
                var patientId = await GetPatientIdFromUser(userId);

                if (patientId == null)
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = "Patient profile not found."
                    });
                }

                var requests = await _db.BloodRequests
                    .Where(r => r.PatientId == patientId.Value)
                    .OrderByDescending(r => r.CreatedAt)
                    .Select(r => new
                    {
                        id = r.RequestId,
                        bloodType = r.BloodType,
                        units = r.UnitsRequired,
                        urgency = r.UrgencyLevel,
                        hospitalId = r.HospitalId,
                        status = r.Status,
                        date = r.CreatedAt.HasValue
                            ? r.CreatedAt.Value.ToString("yyyy-MM-dd")
                            : "N/A",
                        notes = r.Notes
                    })
                    .ToListAsync();

                return Ok(new { success = true, data = requests });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = "Error loading blood requests.",
                    error = ex.Message
                });
            }
        }

        [HttpGet("appointments/{userId}")]
        public async Task<IActionResult> GetAppointments(int userId)
        {
            try
            {
                if (userId <= 0)
                    return BadRequest(new { success = false, message = "Invalid user ID." });

                var patientId = await GetPatientIdFromUser(userId);

                if (patientId == null)
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = "Patient profile not found."
                    });
                }

                var appts = await _db.PatientAppointments
                    .Where(a => a.PatientId == patientId.Value)
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
                return StatusCode(500, new
                {
                    success = false,
                    message = "Error loading appointments.",
                    error = ex.Message
                });
            }
        }
    }
}
