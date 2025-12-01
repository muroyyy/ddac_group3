using Microsoft.AspNetCore.Mvc;
using BloodLine.Data;
using BloodLine.Models;
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

        [HttpPut("profile/{userId}")]
        public async Task<IActionResult> UpdateProfile(int userId, [FromBody] DonorUpdateProfileRequest request)
        {
            var profile = await _context.DonorProfiles.FirstOrDefaultAsync(d => d.UserId == userId);
            
            if (profile == null)
            {
                profile = new DonorProfile
                {
                    UserId = userId,
                    BloodType = request.BloodType,
                    Location = request.Location
                };
                _context.DonorProfiles.Add(profile);
            }
            else
            {
                profile.BloodType = request.BloodType;
                profile.Location = request.Location;
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "Profile updated successfully" });
        }

        [HttpGet("dashboard-stats/{userId}")]
        public async Task<IActionResult> GetDashboardStats(int userId)
        {
            var donorProfile = await _context.DonorProfiles.FirstOrDefaultAsync(d => d.UserId == userId);
            
            var pendingCount = 0;
            if (donorProfile != null)
            {
                pendingCount = await _context.Database
                    .SqlQuery<int>($"SELECT COUNT(*) as Value FROM donation_requests WHERE donor_id = {donorProfile.DonorId} AND status = 'Pending'")
                    .FirstOrDefaultAsync();
            }

            return Ok(new
            {
                totalDonations = donorProfile?.TotalDonations ?? 0,
                pendingRequests = pendingCount,
                bloodType = donorProfile?.BloodType ?? "N/A",
                lastDonation = (string?)null,
                urgentAlerts = 0
            });
        }

        [HttpGet("hospitals")]
        public async Task<IActionResult> GetHospitals()
        {
            var hospitals = await _context.Hospitals
                .Include(h => h.User)
                .Select(h => new
                {
                    id = h.HospitalId,
                    name = h.HospitalName,
                    location = h.Address,
                    phone = h.ContactNumber ?? "N/A",
                    email = h.User.Email
                })
                .ToListAsync();
            
            return Ok(hospitals);
        }

        [HttpGet("donation-requests/{userId}")]
        public async Task<IActionResult> GetDonationRequests(int userId)
        {
            var donorProfile = await _context.DonorProfiles.FirstOrDefaultAsync(d => d.UserId == userId);
            if (donorProfile == null) 
            {
                return Ok(new List<DonationRequestDto>()); // Return empty array instead of 404
            }

            var requests = await _context.Database
                .SqlQueryRaw<DonationRequestDto>(
                    @"SELECT dr.donation_id as Id, dr.status as Status, 
                      dp.blood_type as BloodType, 1 as UnitsRequested,
                      dr.requested_date as CreatedAt, dr.donation_date as UpdatedAt,
                      h.hospital_name as HospitalName, '' as Notes
                      FROM donation_requests dr
                      JOIN donor_profile dp ON dr.donor_id = dp.donor_id
                      JOIN hospital h ON dr.hospital_id = h.hospital_id
                      WHERE dr.donor_id = {0}
                      ORDER BY dr.requested_date DESC", donorProfile.DonorId)
                .ToListAsync();

            return Ok(requests);
        }

        [HttpPost("donation-request")]
        public async Task<IActionResult> CreateDonationRequest([FromQuery] int userId, [FromBody] CreateDonationRequestDto request)
        {
            var donorProfile = await _context.DonorProfiles.FirstOrDefaultAsync(d => d.UserId == userId);
            if (donorProfile == null)
            {
                return BadRequest(new { message = "Donor profile not found. Please complete your profile first." });
            }

            // For now, just use the first hospital as default since we don't have hospital selection in the request
            var hospital = await _context.Hospitals.FirstOrDefaultAsync();
            if (hospital == null)
            {
                return BadRequest(new { message = "No hospitals available" });
            }

            await _context.Database.ExecuteSqlRawAsync(
                @"INSERT INTO donation_requests (donor_id, hospital_id, status, requested_date) 
                  VALUES ({0}, {1}, 'Pending', {2})",
                donorProfile.DonorId, hospital.HospitalId, DateTime.Now);

            return Ok(new { message = "Donation request submitted successfully" });
        }
    }

    public class DonorUpdateProfileRequest
    {
        public string BloodType { get; set; } = "";
        public string Location { get; set; } = "";
    }

    public class DonationRequestDto
    {
        public int Id { get; set; }
        public string Status { get; set; } = "";
        public string BloodType { get; set; } = "";
        public int UnitsRequested { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public string HospitalName { get; set; } = "";
        public string Notes { get; set; } = "";
    }

    public class CreateDonationRequestDto
    {
        public string BloodType { get; set; } = "";
        public int UnitsRequested { get; set; }
        public string? Notes { get; set; }
    }
}