using BloodLine.Data;
using BloodLine.Models;

namespace BloodLine.Services;

public interface IAuditLogService
{
    Task LogAsync(string actionType, int? userId = null);
}

public class AuditLogService : IAuditLogService
{
    private readonly ApplicationDbContext _context;

    public AuditLogService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task LogAsync(string actionType, int? userId = null)
    {
        try
        {
            var log = new AnalyticsLog
            {
                ActionType = actionType,
                PerformedBy = userId,
                Timestamp = DateTime.UtcNow
            };

            _context.AnalyticsLogs.Add(log);
            await _context.SaveChangesAsync();
        }
        catch
        {
            // Silent fail - don't break app if logging fails
        }
    }
}
