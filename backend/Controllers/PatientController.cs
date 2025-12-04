using BloodLine.Data;
using BloodLine.DTOs;
using BloodLine.Models;
using Microsoft.AspNetCore.Mvc;

namespace BloodLine.Controllers
{
    [ApiController]
    [Route("api/patient")]
    public class PatientController : ControllerBase
    {
        private readonly AppDbContext _db;

        public PatientController(AppDbContext db)
        {
            _db = db;
        }

        [HttpPost("blood-request")]
        public async Task<IActionResult> CreateBloodRequest(CreateBloodRequestDto dto)
        {
            // In real production, patientId comes from JWT
            int patientId = 9; // TEMPORARY — you will replace this later

            var newRequest = new BloodRequest
            {
                PatientId = patientId,
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

            return Ok(new
            {
                success = true,
                message = "Blood request created successfully.",
                requestId = newRequest.RequestId
            });
        }
    }
}
