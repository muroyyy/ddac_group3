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


        //Code to cancel upcoming appointment only
        [HttpPut("cancel-appointment/{appointmentId}")]
        public async Task<IActionResult> CancelAppointment(int appointmentId)
        {
            try
            {
                var appointment = await _db.PatientAppointments
                    .FirstOrDefaultAsync(a => a.AppointmentId == appointmentId && a.Status == "Upcoming");

                if (appointment == null)
                {
                    return BadRequest(new { success = false, message = "Appointment not found or already cancelled." });
                }

                // Update status to 'Cancelled'
                appointment.Status = "Cancelled";
                appointment.CreatedAt = DateTime.UtcNow; // Update timestamp to show last update
                _db.PatientAppointments.Update(appointment);
                await _db.SaveChangesAsync();

                return Ok(new { success = true, message = "Appointment cancelled successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = "Error cancelling appointment.",
                    error = ex.Message
                });
            }
        }


        [HttpGet("profile/{userId}")]
        public async Task<IActionResult> GetProfile(int userId)
        {
            try
            {
                var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId);
                if (user == null)
                    return NotFound(new { success = false, message = "User not found." });

                var patientProfile = await _db.PatientProfiles.FirstOrDefaultAsync(p => p.UserId == userId);
                if (patientProfile == null)
                    return NotFound(new { success = false, message = "Patient profile not found." });

                return Ok(new
                {
                    success = true,
                    data = new
                    {
                        fullName = user.FullName,
                        email = user.Email,
                        phone = user.Phone,
                        bloodTypeNeeded = patientProfile.BloodTypeNeeded,
                        medicalCondition = patientProfile.MedicalCondition
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Error loading profile.", error = ex.Message });
            }
        }

        [HttpPut("profile/{userId}")]
        public async Task<IActionResult> UpdateProfile(int userId, [FromBody] UpdatePatientProfileDto dto)
        {
            try
            {
                var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId);
                if (user == null)
                    return NotFound(new { success = false, message = "User not found." });

                var patientProfile = await _db.PatientProfiles.FirstOrDefaultAsync(p => p.UserId == userId);
                if (patientProfile == null)
                    return NotFound(new { success = false, message = "Patient profile not found." });

                if (!string.IsNullOrEmpty(dto.FullName))
                    user.FullName = dto.FullName;
                if (!string.IsNullOrEmpty(dto.Email))
                    user.Email = dto.Email;
                if (!string.IsNullOrEmpty(dto.Phone))
                    user.Phone = dto.Phone;
                if (!string.IsNullOrEmpty(dto.BloodTypeNeeded))
                    patientProfile.BloodTypeNeeded = dto.BloodTypeNeeded;
                if (!string.IsNullOrEmpty(dto.MedicalCondition))
                    patientProfile.MedicalCondition = dto.MedicalCondition;

                await _db.SaveChangesAsync();

                return Ok(new { success = true, message = "Profile updated successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Error updating profile.", error = ex.Message });
            }
        }
    }
}
