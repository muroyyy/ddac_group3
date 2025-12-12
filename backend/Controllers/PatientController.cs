using BloodLine.Data;
using BloodLine.DTOs;
using BloodLine.Models;
using BloodLine.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BloodLine.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PatientController : ControllerBase
    {
        private readonly ApplicationDbContext _db;
        private readonly NotificationService _notificationService;

        public PatientController(ApplicationDbContext db, NotificationService notificationService)
        {
            _db = db;
            _notificationService = notificationService;
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

                // Send confirmation notification to patient
                await SendBloodRequestSubmissionNotification(userId, newRequest.RequestId, newRequest.BloodType, newRequest.CreatedAt ?? DateTime.UtcNow);

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
                        hospitalName = _db.Hospitals.Where(h => h.HospitalId == r.HospitalId).Select(h => h.HospitalName).FirstOrDefault(),
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

                // Check if user exists
                var userExists = await _db.Users.AnyAsync(u => u.Id == userId);
                if (!userExists)
                {
                    return NotFound(new { success = false, message = "User not found." });
                }

                var patientId = await GetPatientIdFromUser(userId);

                if (patientId == null)
                {
                    // Return empty appointments instead of error for users without patient profile
                    return Ok(new { success = true, data = new List<object>() });
                }

                var appts = await _db.PatientAppointments
                    .Where(a => a.PatientId == patientId.Value)
                    .OrderByDescending(a => a.AppointmentDate)
                    .Select(a => new
                    {
                        appointmentId = a.AppointmentId,
                        doctorName = a.DoctorName,
                        appointmentDate = a.AppointmentDate.ToString("yyyy-MM-dd HH:mm"),
                        status = a.Status,
                        doctorNotes = a.DoctorNotes
                    })
                    .ToListAsync();

                return Ok(new { success = true, data = appts });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetAppointments for userId {userId}: {ex.Message}");
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
                        medicalCondition = patientProfile.MedicalCondition,
                        dateOfBirth = patientProfile.DateOfBirth?.ToString("yyyy-MM-dd"),
                        address = patientProfile.Address,
                        emergencyContact = patientProfile.EmergencyContact,
                        allergies = patientProfile.Allergies
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

                if (dto.FullName != null)
                    user.FullName = dto.FullName;
                if (dto.Email != null)
                    user.Email = dto.Email;
                if (dto.Phone != null)
                    user.Phone = dto.Phone;
                if (dto.BloodTypeNeeded != null)
                    patientProfile.BloodTypeNeeded = dto.BloodTypeNeeded;
                if (dto.MedicalCondition != null)
                    patientProfile.MedicalCondition = dto.MedicalCondition;
                if (dto.DateOfBirth != null)
                    patientProfile.DateOfBirth = dto.DateOfBirth;
                if (dto.Address != null)
                    patientProfile.Address = dto.Address;
                if (dto.EmergencyContact != null)
                    patientProfile.EmergencyContact = dto.EmergencyContact;
                if (dto.Allergies != null)
                    patientProfile.Allergies = dto.Allergies;

                await _db.SaveChangesAsync();

                return Ok(new { success = true, message = "Profile updated successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Error updating profile.", error = ex.Message });
            }
        }

        private async Task SendBloodRequestSubmissionNotification(int userId, int requestId, string bloodType, DateTime submittedAt)
        {
            try
            {
                var message = $"Your blood request for {bloodType} has been submitted successfully on {submittedAt:MMM dd, yyyy} at {submittedAt:HH:mm}. Request ID: #{requestId}";

                await _db.Database.ExecuteSqlRawAsync(
                    @"INSERT INTO notifications (user_id, title, message, type, is_read, created_at) 
                      VALUES ({0}, {1}, {2}, {3}, 0, NOW())",
                    userId,
                    "Blood Request Submitted",
                    message,
                    "blood_request_submitted");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Failed to send submission notification: {ex.Message}");
            }
        }
    }
}
