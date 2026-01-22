using Amazon.SimpleNotificationService;
using Amazon.SimpleNotificationService.Model;
// AWS SNS library – used to send email notifications

using BloodLine.Data;
// Used to access the database (notifications table)

using Microsoft.EntityFrameworkCore;
// Used to run raw SQL commands


namespace BloodLine.Services
{
    // This service handles sending notifications to patients
    // It sends:
    // 1. Email notifications using AWS SNS
    // 2. In-app notifications by saving records in the database
    public class SnsService
    {
        // AWS SNS client (used to publish messages)
        private readonly IAmazonSimpleNotificationService _snsClient;

        // Database context (used to save notifications)
        private readonly ApplicationDbContext _db;

        // SNS Topic ARN (where notifications are sent)
        private readonly string _topicArn;

        // Constructor – runs when this service is created
        public SnsService(ApplicationDbContext db)
        {
            // Create SNS client in Singapore region
            _snsClient = new AmazonSimpleNotificationServiceClient(
                Amazon.RegionEndpoint.APSoutheast1
            );

            // Store database context
            _db = db;

            // Get SNS Topic ARN from environment variable
            // If not found, use default ARN
            _topicArn = Environment.GetEnvironmentVariable("SNS_TOPIC_ARN")
                ?? "arn:aws:sns:ap-southeast-1:007027391333:bloodline-notifications";
        }


        // ===============================
        // BLOOD REQUEST NOTIFICATION
        // ===============================
        public async Task SendBloodRequestNotification(
            string patientEmail,
            string status,
            int requestId,
            string bloodType,
            int userId
        )
        {
            try
            {
                // Email subject
                var subject = $"Blood Request {status} - BloodLine";

                // Message content based on request status
                var message = status.ToLower() switch
                {
                    "approved" =>
                        $"Good news! Your blood request #{requestId} for {bloodType} has been approved. Please check your appointments for next steps.",

                    "rejected" =>
                        $"Your blood request #{requestId} for {bloodType} has been rejected. Please contact the hospital for more information.",

                    _ =>
                        $"Your blood request #{requestId} status has been updated to {status}."
                };

                // Create SNS publish request
                var request = new PublishRequest
                {
                    TopicArn = _topicArn,  // Send to SNS topic
                    Subject = subject,     // Email subject
                    Message =
                        $"Dear Patient,\n\n{message}\n\nBest regards,\nBloodLine Team"
                };

                // Send email notification using AWS SNS
                await _snsClient.PublishAsync(request);

                // Save notification in database (for in-app notification)
                await _db.Database.ExecuteSqlRawAsync(@"
                    INSERT INTO notifications (user_id, message, type, is_read, created_at)
                    VALUES ({0}, {1}, {2}, 0, NOW())
                ", userId, message, "Request");
            }
            catch (Exception ex)
            {
                // Log error if SNS fails
                Console.WriteLine($"SNS notification failed: {ex.Message}");
            }
        }


        // ===============================
        // APPOINTMENT NOTIFICATION
        // ===============================
        public async Task SendAppointmentNotification(
            string patientEmail,
            string status,
            int appointmentId,
            int userId
        )
        {
            try
            {
                // Email subject
                var subject = $"Appointment {status} - BloodLine";

                // Message content based on appointment status
                var message = status.ToLower() switch
                {
                    "completed" =>
                        $"Your appointment #{appointmentId} has been completed. Thank you for using BloodLine.",

                    "cancelled" =>
                        $"Your appointment #{appointmentId} has been cancelled. Please contact the hospital for rescheduling.",

                    "updated" =>
                        $"Your appointment #{appointmentId} details have been updated. Please check your appointments for the latest information.",

                    _ =>
                        $"Your appointment #{appointmentId} status has been updated to {status}."
                };

                // Create SNS publish request
                var request = new PublishRequest
                {
                    TopicArn = _topicArn,
                    Subject = subject,
                    Message =
                        $"Dear Patient,\n\n{message}\n\nBest regards,\nBloodLine Team"
                };

                // Send email via AWS SNS
                await _snsClient.PublishAsync(request);

                // Save appointment notification in database
                await _db.Database.ExecuteSqlRawAsync(@"
                    INSERT INTO notifications (user_id, message, type, is_read, created_at, appointment_id)
                    VALUES ({0}, {1}, {2}, 0, NOW(), {3})
                ", userId, message, "Appointment", appointmentId);
            }
            catch (Exception ex)
            {
                // Log error if SNS fails
                Console.WriteLine($"SNS appointment notification failed: {ex.Message}");
            }
        }
    }
}
