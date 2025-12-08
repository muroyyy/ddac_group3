using Amazon.SimpleNotificationService;
using Amazon.SimpleNotificationService.Model;

namespace BloodLine.Services;

public class SNSService : ISNSService
{
    private readonly IAmazonSimpleNotificationService _snsClient;
    private readonly ILogger<SNSService> _logger;

    public SNSService(IAmazonSimpleNotificationService snsClient, ILogger<SNSService> logger)
    {
        _snsClient = snsClient;
        _logger = logger;
    }

    public async Task SendAppointmentNotificationAsync(string phoneNumber, string email, string message)
    {
        try
        {
            // Send SMS if phone number is provided
            if (!string.IsNullOrEmpty(phoneNumber))
            {
                await _snsClient.PublishAsync(new PublishRequest
                {
                    PhoneNumber = phoneNumber,
                    Message = message
                });
            }

            // Log the notification (in production, you could also send email via SNS)
            _logger.LogInformation($"Appointment notification sent: {message}");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send SNS notification");
        }
    }
}