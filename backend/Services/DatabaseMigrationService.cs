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

        try
        {
            await _db.Database.ExecuteSqlRawAsync(@"
                CREATE TABLE IF NOT EXISTS patient_appointments (
                    appointment_id INT AUTO_INCREMENT PRIMARY KEY,
                    patient_id INT NOT NULL,
                    request_id INT NOT NULL,
                    hospital_id INT NOT NULL,
                    appointment_date DATETIME NOT NULL,
                    doctor_name VARCHAR(255) NULL,
                    location VARCHAR(255) NULL,
                    status VARCHAR(50) NOT NULL DEFAULT 'Upcoming',
                    doctor_notes TEXT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ");
            _logger.LogInformation("✅ Database migration completed: patient_appointments table created");
        }
        catch (Exception ex)
        {
            _logger.LogWarning($"⚠️ Migration warning (may already exist): {ex.Message}");
        }

        try
        {
            await _db.Database.ExecuteSqlRawAsync(@"
                CREATE TABLE IF NOT EXISTS notifications (
                    notification_id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT NOT NULL,
                    title VARCHAR(255) NOT NULL,
                    message TEXT NOT NULL,
                    type VARCHAR(50) NOT NULL,
                    is_read BOOLEAN DEFAULT FALSE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    appointment_id INT NULL
                )
            ");
            _logger.LogInformation("✅ Database migration completed: notifications table created");
        }
        catch (Exception ex)
        {
            _logger.LogWarning($"⚠️ Migration warning (may already exist): {ex.Message}");
        }
    }
}
