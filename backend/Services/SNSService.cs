using Amazon.SimpleNotificationService;
using Amazon.SimpleNotificationService.Model;

namespace BloodLine.Services
{
    public class SnsService
    {
        private readonly IAmazonSimpleNotificationService _snsClient;
        private readonly string _topicArn;

        public SnsService()
        {
            _snsClient = new AmazonSimpleNotificationServiceClient(Amazon.RegionEndpoint.APSoutheast1);
            // Your actual SNS Topic ARN
            _topicArn = Environment.GetEnvironmentVariable("SNS_TOPIC_ARN") ?? "arn:aws:sns:ap-southeast-1:007027391333:bloodline-notifications";
        }

        public async Task SendBloodRequestNotification(string patientEmail, string status, int requestId, string bloodType)
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

                var request = new PublishRequest
                {
                    TopicArn = _topicArn,
                    Subject = subject,
                    Message = $"Dear Patient,\n\n{message}\n\nBest regards,\nBloodLine Team"
                };

                await _snsClient.PublishAsync(request);
            }
            catch (Exception ex)
            {
                // Log error but don't fail the main operation
                Console.WriteLine($"SNS notification failed: {ex.Message}");
            }
        }
    }
}