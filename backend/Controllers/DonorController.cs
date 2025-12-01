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
                location = profile?.Location ?? "",
                isAvailable = profile?.IsAvailable ?? true
            });
        }

        [HttpPut("profile/{userId}")]
        public async Task<IActionResult> UpdateProfile(int userId, [FromBody] UpdateProfileRequest request)
        {
            var profile = await _context.DonorProfiles.FirstOrDefaultAsync(d => d.UserId == userId);
            
            if (profile == null)
            {
                profile = new DonorProfile
                {
                    UserId = userId,
                    BloodType = request.BloodType,
                    Location = request.Location,
                    IsAvailable = request.IsAvailable
                };
                _context.DonorProfiles.Add(profile);
            }
            else
            {
                profile.BloodType = request.BloodType;
                profile.Location = request.Location;
                profile.IsAvailable = request.IsAvailable;
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
                isAvailable = true,
                urgentAlerts = 0
            });
        }

        [HttpGet("hospitals")]
        public async Task<IActionResult> GetHospitals()
        {
            var hospitals = new[]
            {
                new { id = 1, name = "Kuala Lumpur General Hospital", location = "Kuala Lumpur", phone = "+603-2615-5555", email = "info@klgh.gov.my" },
                new { id = 2, name = "Pantai Hospital Kuala Lumpur", location = "Bangsar, KL", phone = "+603-2296-0888", email = "info@pantai.com.my" },
                new { id = 3, name = "Prince Court Medical Centre", location = "Kuala Lumpur", phone = "+603-2160-0000", email = "info@princecourt.com" },
                new { id = 4, name = "Sunway Medical Centre", location = "Petaling Jaya", phone = "+603-7491-9191", email = "info@sunwaymedical.com" },
                new { id = 5, name = "Gleneagles Kuala Lumpur", location = "Ampang, KL", phone = "+603-4141-3000", email = "info@gleneagles.com.my" }
            };
            
            return Ok(hospitals);
        }
    }

    public class UpdateProfileRequest
    {
        public string BloodType { get; set; } = "";
        public string Location { get; set; } = "";
        public bool IsAvailable { get; set; }
    }
}