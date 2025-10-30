using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BloodLine.Data;
using BloodLine.Models;

namespace BloodLine.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AdminController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<AdminController> _logger;

    public AdminController(ApplicationDbContext context, ILogger<AdminController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet("users")]
    public async Task<ActionResult<IEnumerable<object>>> GetUsers()
    {
        try
        {
            var users = await _context.Users
                .Select(u => new
                {
                    id = u.Id,
                    fullName = u.FullName,
                    email = u.Email,
                    role = u.Role.ToString(),
                    status = u.Status.ToString(),
                    createdAt = u.CreatedAt.ToString("yyyy-MM-ddTHH:mm:ss.fffZ"),
                    phone = u.Phone
                })
                .OrderByDescending(u => u.id)
                .ToListAsync();

            return Ok(users);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving users");
            return StatusCode(500, new { message = "Internal server error" });
        }
    }

    [HttpPut("users/{id}/status")]
    public async Task<ActionResult> UpdateUserStatus(int id, [FromBody] UpdateUserStatusRequest request)
    {
        try
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            if (Enum.TryParse<UserStatus>(request.Status, true, out var status))
            {
                user.Status = status;
                await _context.SaveChangesAsync();
                return Ok(new { message = "User status updated successfully" });
            }

            return BadRequest(new { message = "Invalid status value" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating user status");
            return StatusCode(500, new { message = "Internal server error" });
        }
    }

    [HttpGet("dashboard/stats")]
    public async Task<ActionResult<object>> GetDashboardStats()
    {
        try
        {
            var totalUsers = await _context.Users.CountAsync();
            var activeDonors = await _context.Users.CountAsync(u => u.Role == UserRole.Donor && u.Status == UserStatus.Active);
            var bloodRequests = 0; // Placeholder - implement when blood_requests table is ready
            var systemHealth = "99.8%";

            return Ok(new
            {
                totalUsers,
                activeDonors,
                bloodRequests,
                systemHealth
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving dashboard stats");
            return Ok(new
            {
                totalUsers = 0,
                activeDonors = 0,
                bloodRequests = 0,
                systemHealth = "Unknown"
            });
        }
    }
}

public class UpdateUserStatusRequest
{
    public string Status { get; set; } = string.Empty;
}