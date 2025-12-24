using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BloodLine.Data;
using BloodLine.Models;
using BloodLine.Models.Users;
using BloodLine.Models.Auth;
using BloodLine.Models.Hospital;
using BloodLine.Models.Blood;
using BloodLine.Models.Appointments;
using BloodLine.Models.System;
using BloodLine.Models.Users;
using BloodLine.Models.Auth;
using BloodLine.Models.Hospital;
using BloodLine.Models.Blood;
using BloodLine.Models.Appointments;
using BloodLine.Models.System;
using BloodLine.Services;

namespace BloodLine.Controllers.Auth;

[ApiController]
[Route("api/[controller]")]
public class VerificationController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<VerificationController> _logger;
    private readonly IAuditLogService _auditLog;

    public VerificationController(ApplicationDbContext context, ILogger<VerificationController> logger, IAuditLogService auditLog)
    {
        _context = context;
        _logger = logger;
        _auditLog = auditLog;
    }

    [HttpGet("pending")]
    public async Task<ActionResult<object>> GetPendingVerifications()
    {
        try
        {
            var pendingUsers = await _context.Users
                .Include(u => u.Documents)
                .Where(u => u.VerificationStatus == VerificationStatus.Pending && 
                           (u.Role == UserRole.Donor || u.Role == UserRole.Patient || u.Role == UserRole.Hospital))
                .Select(u => new
                {
                    u.Id,
                    u.FullName,
                    u.Email,
                    u.Phone,
                    Role = u.Role.ToString(),
                    VerificationStatus = u.VerificationStatus.ToString(),
                    u.CreatedAt,
                    Documents = u.Documents.Select(d => new
                    {
                        d.Id,
                        d.FileName,
                        d.DocumentType,
                        d.UploadedAt
                    }).ToList()
                })
                .ToListAsync();

            return Ok(new { success = true, data = pendingUsers });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching pending verifications");
            return StatusCode(500, new { success = false, message = "Internal server error" });
        }
    }

    [HttpPost("approve/{userId}")]
    public async Task<ActionResult<object>> ApproveUser(int userId)
    {
        try
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
            {
                return NotFound(new { success = false, message = "User not found" });
            }

            user.VerificationStatus = VerificationStatus.Approved;
            await _context.SaveChangesAsync();
            await _auditLog.LogAsync($"User Verification Approved: {user.Email}");

            return Ok(new { success = true, message = "User approved successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error approving user");
            return StatusCode(500, new { success = false, message = "Internal server error" });
        }
    }

    [HttpPost("reject/{userId}")]
    public async Task<ActionResult<object>> RejectUser(int userId, [FromBody] RejectRequest request)
    {
        try
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
            {
                return NotFound(new { success = false, message = "User not found" });
            }

            user.VerificationStatus = VerificationStatus.Rejected;
            await _context.SaveChangesAsync();
            await _auditLog.LogAsync($"User Verification Rejected: {user.Email} - Reason: {request.Reason}");

            return Ok(new { success = true, message = "User rejected successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error rejecting user");
            return StatusCode(500, new { success = false, message = "Internal server error" });
        }
    }
}

public class RejectRequest
{
    public string Reason { get; set; } = string.Empty;
}