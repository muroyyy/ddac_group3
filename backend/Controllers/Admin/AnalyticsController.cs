using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BloodLine.Data;
using BloodLine.Models;
using BloodLine.Models.Users;
using BloodLine.Models.Auth;
using BloodLine.Models.Hospital;
using BloodLine.Models.Blood;
using BloodLine.Models.Appointments;
using System.Text;

namespace BloodLine.Controllers.Admin;

[ApiController]
[Route("api/[controller]")]
public class AnalyticsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<AnalyticsController> _logger;

    public AnalyticsController(ApplicationDbContext context, ILogger<AnalyticsController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet("users-by-role")]
    public async Task<ActionResult<object>> GetUsersByRole()
    {
        try
        {
            var usersByRole = await _context.Users
                .Where(u => u.Status == UserStatus.Active)
                .GroupBy(u => u.Role)
                .Select(g => new
                {
                    role = g.Key.ToString(),
                    count = g.Count()
                })
                .ToListAsync();

            return Ok(usersByRole);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching users by role");
            return Ok(new List<object>());
        }
    }

    [HttpGet("blood-type-distribution")]
    public async Task<ActionResult<object>> GetBloodTypeDistribution()
    {
        try
        {
            var distribution = await _context.DonorProfiles
                .GroupBy(d => d.BloodType)
                .Select(g => new
                {
                    bloodType = g.Key,
                    count = g.Count()
                })
                .OrderByDescending(x => x.count)
                .ToListAsync();

            return Ok(distribution);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching blood type distribution");
            return Ok(new List<object>());
        }
    }

    [HttpGet("request-status")]
    public async Task<ActionResult<object>> GetRequestStatus()
    {
        // Removed dependency on blood_requests table. Return empty result.
        return Ok(new List<object>());
    }

    [HttpGet("user-growth")]
    public async Task<ActionResult<object>> GetUserGrowth()
    {
        try
        {
            var thirtyDaysAgo = DateTime.UtcNow.AddDays(-30);
            
            var growth = await _context.Users
                .Where(u => u.CreatedAt >= thirtyDaysAgo)
                .GroupBy(u => u.CreatedAt.Date)
                .Select(g => new
                {
                    date = g.Key.ToString("yyyy-MM-dd"),
                    count = g.Count()
                })
                .OrderBy(x => x.date)
                .ToListAsync();

            return Ok(growth);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching user growth");
            return Ok(new List<object>());
        }
    }

    [HttpGet("summary")]
    public async Task<ActionResult<object>> GetAnalyticsSummary()
    {
        try
        {
            var totalDonors = await _context.DonorProfiles.CountAsync();
            var totalPatients = await _context.Users.CountAsync(u => u.Role == UserRole.Patient);
            var totalRequests = 0; // removed patient/blood_requests dependency
            var pendingRequests = 0;

            return Ok(new
            {
                totalDonors,
                totalPatients,
                totalRequests,
                pendingRequests
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching analytics summary");
            return Ok(new
            {
                totalDonors = 0,
                totalPatients = 0,
                totalRequests = 0,
                pendingRequests = 0
            });
        }
    }

    [HttpGet("export/csv")]
    public async Task<IActionResult> ExportAnalyticsCSV()
    {
        try
        {
            var csv = new StringBuilder();
            csv.AppendLine("BloodLine Analytics Report");
            csv.AppendLine($"Generated: {DateTime.UtcNow:yyyy-MM-dd HH:mm:ss} UTC");
            csv.AppendLine();

            csv.AppendLine("=== SUMMARY ===");
            var totalDonors = await _context.DonorProfiles.CountAsync();
            var totalPatients = await _context.Users.CountAsync(u => u.Role == UserRole.Patient);
            var totalRequests = 0; // blood_requests removed
            csv.AppendLine($"Total Donors,{totalDonors}");
            csv.AppendLine($"Total Patients,{totalPatients}");
            csv.AppendLine($"Total Requests,{totalRequests}");
            csv.AppendLine();

            csv.AppendLine("=== USERS BY ROLE ===");
            csv.AppendLine("Role,Count");
            var usersByRole = await _context.Users.Where(u => u.Status == UserStatus.Active).GroupBy(u => u.Role).Select(g => new { Role = g.Key.ToString(), Count = g.Count() }).ToListAsync();
            foreach (var role in usersByRole)
                csv.AppendLine($"{role.Role},{role.Count}");
            csv.AppendLine();

            csv.AppendLine("=== BLOOD TYPE DISTRIBUTION ===");
            csv.AppendLine("Blood Type,Donor Count");
            var bloodTypes = await _context.DonorProfiles.GroupBy(d => d.BloodType).Select(g => new { BloodType = g.Key, Count = g.Count() }).OrderByDescending(x => x.Count).ToListAsync();
            foreach (var blood in bloodTypes)
                csv.AppendLine($"{blood.BloodType},{blood.Count}");
            csv.AppendLine();

            // Request status removed along with blood_requests table
            csv.AppendLine("=== REQUEST STATUS ===");
            csv.AppendLine("Status,Count");
            csv.AppendLine($"Pending,0");

            var bytes = Encoding.UTF8.GetBytes(csv.ToString());
            return File(bytes, "text/csv", $"BloodLine_Analytics_{DateTime.UtcNow:yyyyMMdd_HHmmss}.csv");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error exporting analytics CSV");
            return StatusCode(500, new { message = "Error generating report" });
        }
    }
}

public class RequestStatusCount
{
    public string Status { get; set; } = string.Empty;
    public int Count { get; set; }
}
