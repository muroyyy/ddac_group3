using Amazon.SimpleNotificationService;
using Amazon.SimpleNotificationService.Model;
using BloodLine.Data;
using Microsoft.EntityFrameworkCore;

namespace BloodLine.Services
{
    public class NotificationService
    {
        private readonly IAmazonSimpleNotificationService _sns;
        private readonly ApplicationDbContext _db;
        private readonly IConfiguration _config;

        public NotificationService(IAmazonSimpleNotificationService sns, ApplicationDbContext db, IConfiguration config)
        {
            _sns = sns;
            _db = db;
            _config = config;
        }

        public async Task SendAppointmentNotification(int appointmentId, string newStatus)
        {
            try
            {
                // Get appointment details
                var appointment = await _db.PatientAppointments
                    .FirstOrDefaultAsync(a => a.AppointmentId == appointmentId);

                if (appointment == null) return;

                // Get patient details
                var patient = await _db.PatientProfiles
                    .Include(p => p.User)
                    .FirstOrDefaultAsync(p => p.PatientId == appointment.PatientId);

                if (patient == null) return;

                // Create notification message
                var message = newStatus switch
                {
                    "Created" => $"Your appointment with Dr. {appointment.DoctorName} has been scheduled for {appointment.AppointmentDate:MMM dd, yyyy}.",
                    "Completed" => $"Your appointment {appointmentId} with Dr. {appointment.DoctorName} has been completed.",
                    "Cancelled" => $"Your appointment {appointmentId} with Dr. {appointment.DoctorName} has been cancelled.",
                    _ => $"Your appointment {appointmentId} status has been updated to {newStatus}."
                };

                // Save to database notifications table
                var notification = new Models.Notification
                {
                    UserId = patient.UserId,
                    Title = $"Appointment {newStatus}",
                    Message = message,
                    Type = "appointment_update",
                    IsRead = false,
                    CreatedAt = DateTime.UtcNow
                };

                _db.Notifications.Add(notification);
                await _db.SaveChangesAsync();

                // Send SNS notification (optional - for email/SMS)
                var topicArn = _config["AWS:SNS:TopicArn"];
                if (!string.IsNullOrEmpty(topicArn))
                {
                    await _sns.PublishAsync(new PublishRequest
                    {
                        TopicArn = topicArn,
                        Message = message,
                        Subject = $"BloodLine: Appointment {newStatus}"
                    });
                }
            }
            catch (Exception ex)
            {
                // Log error but don't fail the main operation
                Console.WriteLine($"Notification error: {ex.Message}");
            }
        }
    }
}