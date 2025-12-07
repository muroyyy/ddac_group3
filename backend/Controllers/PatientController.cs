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
        // POST: api/patient/blood-request/{userId}
        // Creates a new blood request for a specific patient.
        // This follows the same structure as DonorController (using userId).
        // ----------------------------------------------------------------------
        [HttpPost("blood-request/{userId}")]
        public async Task<IActionResult> CreateBloodRequest(int userId, [FromBody] CreateBloodRequestDto dto)
        {
            // 1. Validate patient exists
            var user = await _db.Users.FindAsync(userId);
            if (user == null)
            {
                return NotFound(new { message = "Patient not found." });
            }

            // 2. Create a new BloodRequest entity
            var newRequest = new BloodRequest
            {
                PatientId = userId,
                HospitalId = dto.HospitalId,
                BloodType = dto.BloodType,
                UnitsRequired = dto.UnitsRequired,
                UrgencyLevel = dto.UrgencyLevel,
                Notes = dto.Notes,
                Status = "Pending",             // Default status
                CreatedAt = DateTime.UtcNow     // Timestamp
            };

            // 3. Save to database
            _db.BloodRequests.Add(newRequest);
            await _db.SaveChangesAsync();

            // 4. Return success response
            return Ok(new
            {
                success = true,
                message = "Blood request created successfully.",
                requestId = newRequest.RequestId
            });
        }



        // ----------------------------------------------------------------------
        // GET: api/patient/blood-requests/{userId}
        // Returns all blood requests submitted by this patient.
        // Sorted newest -> oldest.
        // ----------------------------------------------------------------------
        [HttpGet("blood-requests/{userId}")]
        public async Task<IActionResult> GetBloodRequests(int userId)
        {
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

    }
}
