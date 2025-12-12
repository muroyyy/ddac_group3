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
                    "Created" => $"Your appointment has been scheduled for {appointment.AppointmentDate:MMM dd, yyyy}.",
                    "Completed" => $"Your appointment {appointmentId} has been completed.",
                    "Cancelled" => $"Your appointment {appointmentId} has been cancelled.",
                    _ => $"Your appointment {appointmentId} status has been updated to {newStatus}."
                };

                // Save to database notifications table using raw SQL
                await _db.Database.ExecuteSqlRawAsync(
                    @"INSERT INTO notifications (user_id, title, message, type, is_read, created_at) 
                      VALUES ({0}, {1}, {2}, {3}, 0, NOW())",
                    patient.UserId,
                    $"Appointment {newStatus}",
                    message,
                    "appointment_update");

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

        public async Task SendBloodRequestSubmissionNotification(int userId, string bloodType)
        {
            try
            {
                await _db.Database.ExecuteSqlRawAsync(
                    @"INSERT INTO notifications (user_id, title, message, type, is_read, created_at) 
                      VALUES ({0}, {1}, {2}, {3}, 0, NOW())",
                    userId,
                    "Blood Request Submitted",
                    $"Your blood request for {bloodType} has been submitted and is being reviewed by hospitals.",
                    "blood_request_submitted");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Notification error: {ex.Message}");
            }
        }
    }
}