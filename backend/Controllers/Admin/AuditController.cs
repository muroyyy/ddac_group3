using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BloodLine.Data;
using System.Text;

namespace BloodLine.Controllers.Admin;

[ApiController]
[Route("api/[controller]")]
public class AuditController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<AuditController> _logger;

    public AuditController(ApplicationDbContext context, ILogger<AuditController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet("logs")]
    public async Task<ActionResult<object>> GetAuditLogs(
        [FromQuery] string? actionType = null,
        [FromQuery] int? userId = null,
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50)
    {
        try
        {
            var query = _context.AnalyticsLogs
                .Include(a => a.User)
                .AsQueryable();

            if (!string.IsNullOrEmpty(actionType))
                query = query.Where(a => a.ActionType.Contains(actionType));

            if (userId.HasValue)
                query = query.Where(a => a.PerformedBy == userId.Value);

            if (startDate.HasValue)
                query = query.Where(a => a.Timestamp >= startDate.Value);

            if (endDate.HasValue)
                query = query.Where(a => a.Timestamp <= endDate.Value);

            var totalCount = await query.CountAsync();
            
            var logs = await query
                .OrderByDescending(a => a.Timestamp)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(a => new
                {
                    logId = a.LogId,
                    actionType = a.ActionType,
                    performedBy = a.PerformedBy,
                    userName = a.User != null ? a.User.FullName : "System",
                    userEmail = a.User != null ? a.User.Email : null,
                    userRole = a.User != null ? a.User.Role.ToString() : null,
                    timestamp = a.Timestamp
                })
                .ToListAsync();

            return Ok(new
            {
                logs,
                totalCount,
                page,
                pageSize,
                totalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving audit logs");
            return StatusCode(500, new { message = "Internal server error" });
        }
    }

    [HttpGet("action-types")]
    public async Task<ActionResult<IEnumerable<string>>> GetActionTypes()
    {
        try
        {
            var actionTypes = await _context.AnalyticsLogs
                .Select(a => a.ActionType)
                .Distinct()
                .OrderBy(a => a)
                .ToListAsync();

            return Ok(actionTypes);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving action types");
            return Ok(new List<string>());
        }
    }

    [HttpGet("export")]
    public async Task<ActionResult> ExportLogs(
        [FromQuery] string? actionType = null,
        [FromQuery] int? userId = null,
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null)
    {
        try
        {
            var query = _context.AnalyticsLogs
                .Include(a => a.User)
                .AsQueryable();

            if (!string.IsNullOrEmpty(actionType))
                query = query.Where(a => a.ActionType.Contains(actionType));

            if (userId.HasValue)
                query = query.Where(a => a.PerformedBy == userId.Value);

            if (startDate.HasValue)
                query = query.Where(a => a.Timestamp >= startDate.Value);

            if (endDate.HasValue)
                query = query.Where(a => a.Timestamp <= endDate.Value);

            var logs = await query
                .OrderByDescending(a => a.Timestamp)
                .Select(a => new
                {
                    LogId = a.LogId,
                    ActionType = a.ActionType,
                    UserName = a.User != null ? a.User.FullName : "System",
                    UserEmail = a.User != null ? a.User.Email : "",
                    UserRole = a.User != null ? a.User.Role.ToString() : "",
                    Timestamp = a.Timestamp.ToString("yyyy-MM-dd HH:mm:ss")
                })
                .ToListAsync();

            var csv = "Log ID,Action Type,User Name,User Email,User Role,Timestamp\n";
            csv += string.Join("\n", logs.Select(l => 
                $"{l.LogId},\"{l.ActionType}\",\"{l.UserName}\",\"{l.UserEmail}\",\"{l.UserRole}\",{l.Timestamp}"));

            var bytes = Encoding.UTF8.GetBytes(csv);
            return File(bytes, "text/csv", $"audit_logs_{DateTime.UtcNow:yyyyMMdd_HHmmss}.csv");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error exporting audit logs");
            return StatusCode(500, new { message = "Internal server error" });
        }
    }
}
