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
            return Ok(new
            {
                totalDonations = 0,
                pendingRequests = 0,
                bloodType = "O+",
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
    }

    public class DonorUpdateProfileRequest
    {
        public string BloodType { get; set; } = "";
        public string Location { get; set; } = "";
    }
}