using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BloodLine.Data;
using BloodLine.Models;

namespace BloodLine.Controllers;

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
        try
        {
            var statusBreakdown = await _context.Database
                .SqlQuery<RequestStatusCount>($"SELECT status as Status, COUNT(*) as Count FROM blood_requests GROUP BY status")
                .ToListAsync();

            var result = statusBreakdown.Select(s => new
            {
                status = s.Status,
                count = s.Count
            });

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching request status");
            return Ok(new List<object>());
        }
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
            var totalPatients = await _context.PatientProfiles.CountAsync();
            var totalRequests = await _context.Database
                .SqlQuery<int>($"SELECT COUNT(*) as Value FROM blood_requests")
                .FirstOrDefaultAsync();
            var pendingRequests = await _context.Database
                .SqlQuery<int>($"SELECT COUNT(*) as Value FROM blood_requests WHERE status = 'Pending'")
                .FirstOrDefaultAsync();

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
}

public class RequestStatusCount
{
    public string Status { get; set; } = string.Empty;
    public int Count { get; set; }
}
