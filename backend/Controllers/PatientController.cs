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

        [HttpPost("blood-request/{userId}")]
        public async Task<IActionResult> CreateBloodRequest(int userId, [FromBody] CreateBloodRequestDto dto)
        {
            try
            {
                if (userId <= 0)
                    return BadRequest(new { success = false, message = "Invalid patient ID." });

                var newRequest = new BloodRequest
                {
                    PatientId = userId,
                    HospitalId = dto.HospitalId,
                    BloodType = dto.BloodType,
                    UnitsRequired = dto.UnitsRequired,
                    UrgencyLevel = dto.UrgencyLevel,
                    Notes = dto.Notes,
                    Status = "Pending",
                    CreatedAt = DateTime.UtcNow
                };

                _db.BloodRequests.Add(newRequest);
                await _db.SaveChangesAsync();

                return Ok(new { success = true, requestId = newRequest.RequestId });
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


        // ----------------------------------------------------------------------
        // GET: api/patient/blood-requests
        // TEMPORARY VERSION: Always loads requests for patientId = 9
        // ----------------------------------------------------------------------
       [HttpGet("blood-requests/{userId}")]
        public async Task<IActionResult> GetBloodRequests(int userId)
        {
            try
            {
                if (userId <= 0)
                    return BadRequest(new { success = false, message = "Invalid patient ID." });

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
                        date = r.CreatedAt.Value.ToString("yyyy-MM-dd")
                    })
                    .ToListAsync();

                return Ok(new { success = true, data = requests });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = "Error loading requests.",
                    error = ex.Message
                });
            }
        }
 
    }
}
