using BloodLine.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BloodLine.Controllers
{
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
                var notifications = await _db.Notifications
                    .Where(n => n.UserId == userId)
                    .OrderByDescending(n => n.CreatedAt)
                    .Select(n => new
                    {
                        id = n.NotificationId,
                        title = n.Title,
                        message = n.Message,
                        type = n.Type,
                        isRead = n.IsRead,
                        createdAt = n.CreatedAt.ToString("yyyy-MM-dd HH:mm"),
                        appointmentId = n.AppointmentId
                    })
                    .ToListAsync();

                return Ok(new { success = true, data = notifications });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Error loading notifications.", error = ex.Message });
            }
        }

        [HttpPut("mark-read/{notificationId}")]
        public async Task<IActionResult> MarkAsRead(int notificationId)
        {
            try
            {
                var notification = await _db.Notifications.FindAsync(notificationId);
                if (notification == null)
                    return NotFound(new { success = false, message = "Notification not found." });

                notification.IsRead = true;
                await _db.SaveChangesAsync();

                return Ok(new { success = true, message = "Notification marked as read." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Error updating notification.", error = ex.Message });
            }
        }
    }
}