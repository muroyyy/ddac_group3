using BloodLine.Data;
using Microsoft.EntityFrameworkCore;

namespace BloodLine.Services;

public class DatabaseMigrationService
{
    private readonly ApplicationDbContext _db;
    private readonly ILogger<DatabaseMigrationService> _logger;

    public DatabaseMigrationService(ApplicationDbContext db, ILogger<DatabaseMigrationService> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task EnsureBloodRequestsTableAsync()
    {
        try
        {
            await _db.Database.ExecuteSqlRawAsync(@"
                ALTER TABLE blood_requests 
                ADD COLUMN IF NOT EXISTS notes TEXT NULL
            ");
            _logger.LogInformation("✅ Database migration completed: notes column added to blood_requests");
        }
        catch (Exception ex)
        {
            _logger.LogWarning($"⚠️ Migration warning (may already exist): {ex.Message}");
        }
    }
}
