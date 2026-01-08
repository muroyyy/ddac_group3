using Microsoft.AspNetCore.Mvc;
using Amazon.SimpleNotificationService;
using Amazon.SimpleNotificationService.Model;

namespace BloodLine.Controllers
{
    [ApiController]
    [Route("api/patient/email")]
    public class EmailController : ControllerBase
    {
        private readonly IAmazonSimpleNotificationService _sns;

        public EmailController(IAmazonSimpleNotificationService sns)
        {
            _sns = sns;
        }

        [HttpPost("send")]
        public async Task<IActionResult> SendEmail([FromBody] SendEmailRequest request)
        {
            try
            {
                await _sns.PublishAsync(new PublishRequest
                {
                    TopicArn = "arn:aws:sns:ap-southeast-1:your-account:bloodline-notifications",
                    Message = request.Message,
                    Subject = request.Subject
                });

                return Ok(new { success = true, message = "Email sent successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }
    }

    public class SendEmailRequest
    {
        public string Subject { get; set; } = "";
        public string Message { get; set; } = "";
    }
}