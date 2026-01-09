using Microsoft.AspNetCore.Mvc;
using BloodLine.Data;
using BloodLine.Models;
using BloodLine.Models.Users;
using BloodLine.Models.Auth;
using BloodLine.Models.Hospital;
using BloodLine.Models.Blood;
using BloodLine.Models.Appointments;
using BloodLine.Models.System;
using Microsoft.EntityFrameworkCore;

namespace BloodLine.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DonorController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public DonorController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("profile/{userId}")]
        public async Task<IActionResult> GetProfile(int userId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return NotFound();

            var profile = await _context.DonorProfiles.FirstOrDefaultAsync(d => d.UserId == userId);
            
            return Ok(new
            {
                userId = user.Id,
                fullName = user.FullName,
                email = user.Email,
                phone = user.Phone,
                bloodType = profile?.BloodType ?? "",
                location = profile?.Location ?? ""
            });
        }

        [HttpGet("hospitals")]
        public async Task<IActionResult> GetHospitals()
        {
            try
            {
                var hospitals = await _context.Database
                    .SqlQueryRaw<HospitalDto>(
                        @"SELECT hospital_id as Id, hospital_name as Name, 
                          address as Location, contact_number as Phone
                          FROM hospital")
                    .ToListAsync();
                
                return Ok(hospitals);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error loading hospitals", error = ex.Message });
            }
        }

        [HttpPost("donation-request")]
        public async Task<IActionResult> CreateDonationRequest([FromQuery] int userId, [FromBody] CreateDonationRequestDto request)
        {
            var donorProfile = await _context.DonorProfiles.FirstOrDefaultAsync(d => d.UserId == userId);
            if (donorProfile == null)
            {
                return BadRequest(new { message = "Donor profile not found. Please complete your profile first." });
            }

            await _context.Database.ExecuteSqlRawAsync(
                @"INSERT INTO donation_requests (donor_id, hospital_id, status, requested_date, units_required) 
                  VALUES ({0}, {1}, 'Pending', {2}, {3})",
                donorProfile.DonorId, request.HospitalId, DateTime.Now, request.UnitsRequested);

            return Ok(new { message = "Donation request submitted successfully" });
        }
    }

    public class HospitalDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = "";
        public string Location { get; set; } = "";
        public string Phone { get; set; } = "";
    }

    public class CreateDonationRequestDto
    {
        public string BloodType { get; set; } = "";
        public int UnitsRequested { get; set; }
        public string? Notes { get; set; }
        public int HospitalId { get; set; }
    }
}