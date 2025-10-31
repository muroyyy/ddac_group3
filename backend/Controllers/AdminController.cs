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

    [HttpGet("users/{id}")]
    public async Task<ActionResult<object>> GetUser(int id)
    {
        try
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            return Ok(new
            {
                id = user.Id,
                fullName = user.FullName,
                email = user.Email,
                role = user.Role.ToString(),
                status = user.Status.ToString(),
                phone = user.Phone,
                createdAt = user.CreatedAt.ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving user");
            return StatusCode(500, new { message = "Internal server error" });
        }
    }

    [HttpPut("users/{id}")]
    public async Task<ActionResult> UpdateUser(int id, [FromBody] UpdateUserRequest request)
    {
        try
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            user.FullName = request.FullName;
            user.Phone = request.Phone;
            
            if (Enum.TryParse<UserRole>(request.Role, true, out var role))
            {
                user.Role = role;
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "User updated successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating user");
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

    [HttpGet("profile")]
    public async Task<ActionResult<object>> GetProfile()
    {
        try
        {
            // For demo purposes, return admin user data
            // In production, get from authenticated user context
            var adminUser = await _context.Users.FirstOrDefaultAsync(u => u.Role == UserRole.Admin);
            if (adminUser == null)
            {
                return NotFound(new { message = "Admin profile not found" });
            }

            return Ok(new
            {
                fullName = adminUser.FullName,
                email = adminUser.Email,
                phone = adminUser.Phone ?? "",
                location = adminUser.Location ?? ""
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving admin profile");
            return StatusCode(500, new { message = "Internal server error" });
        }
    }

    [HttpPut("profile")]
    public async Task<ActionResult> UpdateProfile([FromBody] UpdateProfileRequest request)
    {
        try
        {
            // For demo purposes, update admin user
            // In production, get from authenticated user context
            var adminUser = await _context.Users.FirstOrDefaultAsync(u => u.Role == UserRole.Admin);
            if (adminUser == null)
            {
                return NotFound(new { message = "Admin profile not found" });
            }

            adminUser.FullName = request.FullName;
            adminUser.Email = request.Email;
            adminUser.Phone = request.Phone;
            adminUser.Location = request.Location;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Profile updated successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating admin profile");
            return StatusCode(500, new { message = "Internal server error" });
        }
    }

    [HttpPut("profile/password")]
    public async Task<ActionResult> UpdatePassword([FromBody] UpdatePasswordRequest request)
    {
        try
        {
            // For demo purposes, update admin user password
            // In production, get from authenticated user context and verify current password
            var adminUser = await _context.Users.FirstOrDefaultAsync(u => u.Role == UserRole.Admin);
            if (adminUser == null)
            {
                return NotFound(new { message = "Admin profile not found" });
            }

            // In production, verify current password here
            // For demo, just update with new password hash
            adminUser.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);

            await _context.SaveChangesAsync();
            return Ok(new { message = "Password updated successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating password");
            return StatusCode(500, new { message = "Internal server error" });
        }
    }
}

public class UpdateUserRequest
{
    public string FullName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
}

public class UpdateUserStatusRequest
{
    public string Status { get; set; } = string.Empty;
}

public class UpdateProfileRequest
{
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
}

public class UpdatePasswordRequest
{
    public string CurrentPassword { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
}