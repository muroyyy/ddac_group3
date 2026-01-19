using Amazon.SimpleNotificationService;
using Amazon.SimpleNotificationService.Model;
using BloodLine.Data;
using Microsoft.EntityFrameworkCore;

namespace BloodLine.Services
{
    public class SnsService
    {
        private readonly IAmazonSimpleNotificationService _snsClient;
        private readonly ApplicationDbContext _db;
        private readonly string _topicArn;

        public SnsService(ApplicationDbContext db)
        {
            _snsClient = new AmazonSimpleNotificationServiceClient(Amazon.RegionEndpoint.APSoutheast1);
            _db = db;
            _topicArn = Environment.GetEnvironmentVariable("SNS_TOPIC_ARN") ?? "arn:aws:sns:ap-southeast-1:007027391333:bloodline-notifications";
        }

        public async Task SendBloodRequestNotification(string patientEmail, string status, int requestId, string bloodType, int userId)
        {
            try
            {
                var subject = $"Blood Request {status} - BloodLine";
                var message = status.ToLower() switch
                {
                    "approved" => $"Good news! Your blood request #{requestId} for {bloodType} has been approved. Please check your appointments for next steps.",
                    "rejected" => $"Your blood request #{requestId} for {bloodType} has been rejected. Please contact the hospital for more information.",
                    _ => $"Your blood request #{requestId} status has been updated to {status}."
                };

                // Send SNS email
                var request = new PublishRequest
                {
                    TopicArn = _topicArn,
                    Subject = subject,
                    Message = $"Dear Patient,\n\n{message}\n\nBest regards,\nBloodLine Team"
                };

                await _snsClient.PublishAsync(request);

                // Also save to notifications table
                await _db.Database.ExecuteSqlRawAsync(@"
                    INSERT INTO notifications (user_id, message, type, is_read, created_at)
                    VALUES ({0}, {1}, {2}, 0, NOW())
                ", userId, message, "Request");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"SNS notification failed: {ex.Message}");
            }
        }
    }
}