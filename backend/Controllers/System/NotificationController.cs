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
                var notifications = await _context.Database.SqlQueryRaw<NotificationDto>(@"
                    SELECT notification_id as Id, 'Notification' as Title, message as Message, 
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

                return Ok(new { success = true, data = result });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpPost("test/{userId}")]
        public async Task<IActionResult> CreateTestNotification(int userId)
        {
            try
            {
                await _db.Database.ExecuteSqlRawAsync(@"
                    INSERT INTO notifications (user_id, message, type, is_read, created_at)
                    VALUES ({0}, {1}, {2}, 0, NOW())
                ", userId, "This is a test notification to verify the system is working.", "System");
                
                return Ok(new { success = true, message = "Test notification created" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, error = ex.Message });
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