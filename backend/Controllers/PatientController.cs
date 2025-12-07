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

        // Simple test endpoint
        [HttpGet("test")]
        public IActionResult Test()
        {
            return Ok(new { message = "Patient controller is working!", timestamp = DateTime.UtcNow });
        }

        // ----------------------------------------------------------------------
        // POST: api/patient/blood-request
        // TEMPORARY VERSION: Always uses patientId = 9 for testing.
        // ----------------------------------------------------------------------
        [HttpPost("blood-request")]
        public async Task<IActionResult> CreateBloodRequest([FromBody] CreateBloodRequestDto dto)
        {
            try
            {
                // 🔥 TEMPORARY FIX — use patientId 9
                int patientId = 9;

                if (dto == null)
                {
                    return BadRequest(new { success = false, message = "Request data is required." });
                }

                var newRequest = new BloodRequest
                {
                    PatientId = patientId,  // 👈 STATIC TEST VALUE
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
                Console.WriteLine($"Error creating blood request: {ex.Message}");

                return StatusCode(500, new
                {
                    success = false,
                    message = "Failed to create blood request. Please try again.",
                    error = ex.Message
                });
            }
        }

        // ----------------------------------------------------------------------
        // GET: api/patient/blood-requests
        // TEMPORARY VERSION: Always loads requests for patientId = 9
        // ----------------------------------------------------------------------
        [HttpGet("blood-requests")]
        public async Task<IActionResult> GetBloodRequests()
        {
            try
            {
                // 🔥 TEMPORARY FIX — use patientId 9
                int patientId = 9;

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
                Console.WriteLine($"Error getting blood requests: {ex.Message}");

                return StatusCode(500, new
                {
                    success = false,
                    message = "Failed to retrieve blood requests.",
                    error = ex.Message
                });
            }
        }
    }
}
