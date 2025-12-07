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
        // POST: api/patient/blood-request/{userId}
        // Creates a new blood request for a specific patient.
        // This follows the same structure as DonorController (using userId).
        // ----------------------------------------------------------------------
        [HttpPost("blood-request/{userId}")]
        public async Task<IActionResult> CreateBloodRequest(int userId, [FromBody] CreateBloodRequestDto dto)
        {
            try
            {
                // 1. Validate input
                if (dto == null)
                {
                    return BadRequest(new { success = false, message = "Request data is required." });
                }

                if (userId <= 0)
                {
                    return BadRequest(new { success = false, message = "Valid user ID is required." });
                }

                // 2. Skip user validation for now (might not exist in Users table)
                // var user = await _db.Users.FindAsync(userId);
                // if (user == null)
                // {
                //     return NotFound(new { success = false, message = "Patient not found." });
                // }

                // 3. Create a new BloodRequest entity
                var newRequest = new BloodRequest
                {
                    PatientId = userId,
                    HospitalId = dto.HospitalId,
                    BloodType = dto.BloodType ?? "Unknown",
                    UnitsRequired = dto.UnitsRequired > 0 ? dto.UnitsRequired : 1,
                    UrgencyLevel = dto.UrgencyLevel ?? "Medium",
                    Notes = dto.Notes,
                    Status = "Pending",
                    CreatedAt = DateTime.UtcNow
                };

                // 4. Save to database with error handling
                _db.BloodRequests.Add(newRequest);
                await _db.SaveChangesAsync();

                // 5. Return success response
                return Ok(new
                {
                    success = true,
                    message = "Blood request created successfully.",
                    requestId = newRequest.RequestId
                });
            }
            catch (Exception ex)
            {
                // Log the error and return a safe response
                Console.WriteLine($"Error creating blood request: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                
                return StatusCode(500, new
                {
                    success = false,
                    message = "Failed to create blood request. Please try again.",
                    error = ex.Message // Remove this in production
                });
            }
        }



        // ----------------------------------------------------------------------
        // GET: api/patient/blood-requests/{userId}
        // Returns all blood requests submitted by this patient.
        // Sorted newest -> oldest.
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

                var requests = await _db.BloodRequests
                    .Where(r => r.PatientId == userId)
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
