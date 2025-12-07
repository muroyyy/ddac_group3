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

        // ----------------------------------------------------------------------
        // TEST ENDPOINT
        // ----------------------------------------------------------------------
        [HttpGet("test")]
        public IActionResult Test()
        {
            return Ok(new { message = "Patient controller is working!", timestamp = DateTime.UtcNow });
        }

        // ----------------------------------------------------------------------
        // POST: api/patient/blood-request/{userId}
        // Creates a new blood request for a patient.
        // PERMANENT FIX: userId → patientId (lookup from patient_profile table)
        // ----------------------------------------------------------------------
        [HttpPost("blood-request/{userId}")]
        public async Task<IActionResult> CreateBloodRequest(int userId, [FromBody] CreateBloodRequestDto dto)
        {
            try
            {
                if (dto == null)
                {
                    return BadRequest(new { success = false, message = "Request data is required." });
                }

                if (userId <= 0)
                {
                    return BadRequest(new { success = false, message = "Valid user ID is required." });
                }

                // 🔥 Permanent Fix: Find patient_profile row by userId
                var profile = await _db.PatientProfiles
                    .FirstOrDefaultAsync(p => p.UserId == userId);

                if (profile == null)
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = "Patient profile not found. Please complete patient onboarding."
                    });
                }

                int patientId = profile.PatientId;

                // Create a new blood request
                var newRequest = new BloodRequest
                {
                    PatientId = patientId, // ✔ Correct mapping
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
                Console.WriteLine($"❌ Error creating blood request: {ex.Message}");

                return StatusCode(500, new
                {
                    success = false,
                    message = "Internal server error.",
                    error = ex.Message
                });
            }
        }

        // ----------------------------------------------------------------------
        // GET: api/patient/blood-requests/{userId}
        // Returns all blood requests for this patient.
        // PERMANENT FIX: userId → patientId lookup
        // ----------------------------------------------------------------------
        [HttpGet("blood-requests/{userId}")]
        public async Task<IActionResult> GetBloodRequests(int userId)
        {
            try
            {
                if (userId <= 0)
                {
                    return BadRequest(new { success = false, message = "Valid user ID is required." });
                }

                // 🔥 Permanent Fix: Convert userId → patientId
                var profile = await _db.PatientProfiles
                    .FirstOrDefaultAsync(p => p.UserId == userId);

                if (profile == null)
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = "Patient profile not found. Cannot load blood requests."
                    });
                }

                int patientId = profile.PatientId;

                var requests = await _db.BloodRequests
                    .Where(r => r.PatientId == patientId)
                    .OrderByDescending(r => r.CreatedAt)
                    .Select(r => new
                    {
                        id = r.RequestId,
                        bloodType = r.BloodType,
                        units = r.UnitsRequired,
                        urgency = r.UrgencyLevel,
                        hospitalId = r.HospitalId,
                        status = r.Status,
                        date = r.CreatedAt.HasValue ? r.CreatedAt.Value.ToString("yyyy-MM-dd") : "N/A",
                        notes = r.Notes
                    })
                    .ToListAsync();

                return Ok(new { success = true, data = requests });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error loading blood requests: {ex.Message}");

                return StatusCode(500, new
                {
                    success = false,
                    message = "Failed to load blood requests.",
                    error = ex.Message
                });
            }
        }
    }
}
