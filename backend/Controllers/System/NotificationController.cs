using BloodLine.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BloodLine.Controllers
{
    public class NotificationDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public bool IsRead { get; set; }
        public DateTime CreatedAt { get; set; }
        public int? AppointmentId { get; set; }
    }
    [ApiController]
    [Route("api/[controller]")]
    public class NotificationController : ControllerBase
    {
        private readonly ApplicationDbContext _db;

        public NotificationController(ApplicationDbContext db)
        {
            _db = db;
        }

        [HttpGet("{userId}")]
        public async Task<IActionResult> GetNotifications(int userId)
        {
            try
            {
                // First ensure table exists
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

                // Get count first
                var countResult = await _db.Database.SqlQueryRaw<int>(
                    "SELECT COUNT(*) as Value FROM notifications WHERE user_id = {0}", userId)
                    .FirstOrDefaultAsync();
                    
                Console.WriteLine($"Found {countResult} notifications for user {userId}");

                var notifications = await _db.Database.SqlQueryRaw<NotificationDto>(
                    @"SELECT notification_id as Id, title as Title, message as Message, 
                             type as Type, is_read as IsRead, created_at as CreatedAt,
                             appointment_id as AppointmentId
                      FROM notifications 
                      WHERE user_id = {0} 
                      ORDER BY created_at DESC", userId)
                    .ToListAsync();

                var result = notifications.Select(n => new
                {
                    id = n.Id,
                    title = n.Title,
                    message = n.Message,
                    type = n.Type,
                    isRead = n.IsRead,
                    createdAt = n.CreatedAt.ToString("yyyy-MM-dd HH:mm"),
                    appointmentId = n.AppointmentId
                }).ToList();

                Console.WriteLine($"Returning {result.Count} notifications");
                return Ok(new { success = true, data = result });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Notification error: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return Ok(new { success = true, data = new object[0] });
            }
        }

        [HttpPut("mark-read/{notificationId}")]
        public async Task<IActionResult> MarkAsRead(int notificationId)
        {
            try
            {
                await _db.Database.ExecuteSqlRawAsync(
                    "UPDATE notifications SET is_read = 1 WHERE notification_id = {0}", notificationId);
                return Ok(new { success = true, message = "Notification marked as read." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Error updating notification.", error = ex.Message });
            }
        }


    }
}