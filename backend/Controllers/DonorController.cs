using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BloodLine.Data;
using BloodLine.Models;

namespace BloodLine.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DonorController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<DonorController> _logger;

    public DonorController(ApplicationDbContext context, ILogger<DonorController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet("profile/{userId}")]
    public async Task<ActionResult<object>> GetProfile(int userId)
    {
        try
        {
            var profile = await _context.DonorProfiles.FirstOrDefaultAsync(p => p.UserId == userId);
            var user = await _context.Users.FindAsync(userId);

            if (user == null)
                return NotFound(new { message = "User not found" });

            return Ok(new
            {
                userId = user.Id,
                fullName = user.FullName,
                email = user.Email,
                phone = user.Phone,
                bloodType = profile?.BloodType ?? "",
                location = profile?.Location ?? "",
                isAvailable = profile?.IsAvailable ?? true,
                lastDonationDate = profile?.LastDonationDate?.ToString("yyyy-MM-dd")
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting donor profile");
            return StatusCode(500, new { message = "Internal server error" });
        }
    }

    [HttpPut("profile/{userId}")]
    public async Task<ActionResult> UpdateProfile(int userId, [FromBody] UpdateProfileDto dto)
    {
        try
        {
            var profile = await _context.DonorProfiles.FirstOrDefaultAsync(p => p.UserId == userId);

            if (profile == null)
            {
                profile = new DonorProfile
                {
                    UserId = userId,
                    BloodType = dto.BloodType,
                    Location = dto.Location,
                    IsAvailable = dto.IsAvailable
                };
                _context.DonorProfiles.Add(profile);
            }
            else
            {
                profile.BloodType = dto.BloodType;
                profile.Location = dto.Location;
                profile.IsAvailable = dto.IsAvailable;
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "Profile updated successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating donor profile");
            return StatusCode(500, new { message = "Internal server error" });
        }
    }

    [HttpPost("donation-request")]
    public async Task<ActionResult> CreateDonationRequest([FromQuery] int userId, [FromBody] CreateDonationRequestDto dto)
    {
        try
        {
            var profile = await _context.DonorProfiles.FirstOrDefaultAsync(p => p.UserId == userId);
            if (profile == null)
                return BadRequest(new { message = "Please complete your profile first" });

            var request = new DonationRequest
            {
                DonorId = profile.Id,
                BloodType = dto.BloodType,
                UnitsRequested = dto.UnitsRequested,
                Notes = dto.Notes,
                Status = "Pending"
            };

            _context.DonationRequests.Add(request);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Donation request submitted successfully", requestId = request.Id });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating donation request");
            return StatusCode(500, new { message = "Internal server error" });
        }
    }

    [HttpGet("donation-requests/{userId}")]
    public async Task<ActionResult<IEnumerable<object>>> GetDonationRequests(int userId)
    {
        try
        {
            var profile = await _context.DonorProfiles.FirstOrDefaultAsync(p => p.UserId == userId);
            if (profile == null)
                return Ok(new List<object>());

            var requests = await _context.DonationRequests
                .Where(r => r.DonorId == profile.Id)
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new
                {
                    id = r.Id,
                    bloodType = r.BloodType,
                    unitsRequested = r.UnitsRequested,
                    status = r.Status,
                    notes = r.Notes,
                    createdAt = r.CreatedAt.ToString("yyyy-MM-dd HH:mm"),
                    updatedAt = r.UpdatedAt.HasValue ? r.UpdatedAt.Value.ToString("yyyy-MM-dd HH:mm") : null
                })
                .ToListAsync();

            return Ok(requests);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting donation requests");
            return Ok(new List<object>());
        }
    }

    [HttpGet("donation-history/{userId}")]
    public async Task<ActionResult<IEnumerable<object>>> GetDonationHistory(int userId)
    {
        try
        {
            var profile = await _context.DonorProfiles.FirstOrDefaultAsync(p => p.UserId == userId);
            if (profile == null)
                return Ok(new List<object>());

            var history = await _context.DonationHistory
                .Where(h => h.DonorId == profile.Id)
                .OrderByDescending(h => h.DonationDate)
                .Select(h => new
                {
                    id = h.Id,
                    hospitalName = h.HospitalName,
                    bloodType = h.BloodType,
                    unitsDonated = h.UnitsDonated,
                    donationDate = h.DonationDate.ToString("yyyy-MM-dd"),
                    status = h.Status
                })
                .ToListAsync();

            return Ok(history);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting donation history");
            return Ok(new List<object>());
        }
    }

    [HttpGet("dashboard-stats/{userId}")]
    public async Task<ActionResult<object>> GetDashboardStats(int userId)
    {
        try
        {
            var profile = await _context.DonorProfiles.FirstOrDefaultAsync(p => p.UserId == userId);
            if (profile == null)
            {
                return Ok(new
                {
                    totalDonations = 0,
                    pendingRequests = 0,
                    bloodType = "",
                    lastDonation = (string?)null,
                    isAvailable = true
                });
            }

            var totalDonations = await _context.DonationHistory.CountAsync(h => h.DonorId == profile.Id);
            var pendingRequests = await _context.DonationRequests.CountAsync(r => r.DonorId == profile.Id && r.Status == "Pending");

            return Ok(new
            {
                totalDonations,
                pendingRequests,
                bloodType = profile.BloodType,
                lastDonation = profile.LastDonationDate?.ToString("yyyy-MM-dd"),
                isAvailable = profile.IsAvailable
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting dashboard stats");
            return Ok(new
            {
                totalDonations = 0,
                pendingRequests = 0,
                bloodType = "",
                lastDonation = (string?)null,
                isAvailable = true
            });
        }
    }
}
