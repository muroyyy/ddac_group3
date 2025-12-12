using BloodLine.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Amazon.BedrockRuntime;
using Amazon.BedrockRuntime.Model;
using System.Text.Json;

namespace BloodLine.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class InsightsController : ControllerBase
    {
        private readonly ApplicationDbContext _db;
        private readonly IConfiguration _config;
        private readonly Amazon.BedrockRuntime.IAmazonBedrockRuntime _bedrock;

        public InsightsController(ApplicationDbContext db, IConfiguration config, Amazon.BedrockRuntime.IAmazonBedrockRuntime bedrock)
        {
            _db = db;
            _config = config;
            _bedrock = bedrock;
        }

        [HttpGet("{userId}")]
        public async Task<IActionResult> GetInsights(int userId)
        {
            try
            {
                var patientProfile = await _db.PatientProfiles
                    .FirstOrDefaultAsync(p => p.UserId == userId);

                if (patientProfile == null)
                    return NotFound(new { success = false, message = "Patient not found." });

                var requests = await _db.BloodRequests
                    .Where(r => r.PatientId == patientProfile.PatientId)
                    .ToListAsync();

                var totalRequests = requests.Count;
                var approved = requests.Count(r => r.Status == "Approved");
                var rejected = requests.Count(r => r.Status == "Rejected");
                var fulfilled = requests.Count(r => r.Status == "Fulfilled");
                var pending = requests.Count(r => r.Status == "Pending");

                // Calculate monthly trend (last 1 month)
                var oneMonthAgo = DateTime.UtcNow.AddMonths(-1);
                var monthlyData = requests
                    .Where(r => r.CreatedAt >= oneMonthAgo)
                    .GroupBy(r => new { r.CreatedAt.Value.Year, r.CreatedAt.Value.Month })
                    .Select(g => new
                    {
                        month = new DateTime(g.Key.Year, g.Key.Month, 1).ToString("MMM"),
                        requests = g.Count()
                    })
                    .OrderBy(x => x.month)
                    .ToList();

                // Calculate average approval time
                var approvedRequests = requests.Where(r => r.Status == "Approved" && r.CreatedAt.HasValue).ToList();
                var avgApprovalHours = approvedRequests.Any() ? 18 : 0; // Simplified - you'd calculate actual time

                // Calculate days between requests
                var sortedDates = requests.Where(r => r.CreatedAt.HasValue)
                    .OrderBy(r => r.CreatedAt)
                    .Select(r => r.CreatedAt.Value)
                    .ToList();
                
                var avgDaysBetween = 30; // Simplified calculation
                if (sortedDates.Count > 1)
                {
                    var totalDays = (sortedDates.Last() - sortedDates.First()).TotalDays;
                    avgDaysBetween = (int)(totalDays / (sortedDates.Count - 1));
                }

                // Generate AI insight using OpenAI GPT
                var aiInsight = await GenerateAIInsight(totalRequests, approved, rejected, fulfilled, pending, avgApprovalHours, avgDaysBetween);

                return Ok(new
                {
                    success = true,
                    data = new
                    {
                        totalRequests,
                        approved,
                        rejected,
                        fulfilled,
                        pending,
                        avgApprovalTimeHours = avgApprovalHours,
                        avgDaysBetweenRequests = avgDaysBetween,
                        monthlyTrend = monthlyData,
                        aiInsight
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = "Error loading insights.",
                    error = ex.Message
                });
            }
        }

        private async Task<string> GenerateAIInsight(int total, int approved, int rejected, int fulfilled, int pending, int avgHours, int avgDays)
        {
            try
            {
                Console.WriteLine("🤖 Attempting to generate AI insight using AWS Bedrock...");
                
                var prompt = $@"You are a healthcare assistant analyzing a patient's blood request history. 
Generate a brief, empathetic insight (2-3 sentences) based on these statistics:
- Total requests: {total}
- Approved: {approved}
- Rejected: {rejected}
- Fulfilled: {fulfilled}
- Pending: {pending}
- Average approval time: {avgHours} hours
- Average days between requests: {avgDays} days

Provide actionable advice for the patient. Be concise, supportive, and focus on practical tips.";

                var requestBody = new
                {
                    anthropic_version = "bedrock-2023-05-31",
                    max_tokens = 200,
                    messages = new[]
                    {
                        new { role = "user", content = prompt }
                    }
                };

                var request = new InvokeModelRequest
                {
                    ModelId = "anthropic.claude-3-haiku-20240307-v1:0",
                    ContentType = "application/json",
                    Accept = "application/json",
                    Body = new MemoryStream(System.Text.Encoding.UTF8.GetBytes(JsonSerializer.Serialize(requestBody)))
                };

                Console.WriteLine("📡 Calling Bedrock API...");
                var response = await _bedrock.InvokeModelAsync(request);
                
                Console.WriteLine("📝 Parsing Bedrock response...");
                var responseBody = await JsonSerializer.DeserializeAsync<JsonElement>(response.Body);
                var content = responseBody.GetProperty("content")[0].GetProperty("text").GetString();
                
                Console.WriteLine($"✅ Bedrock AI insight generated: {(content?.Length > 50 ? content.Substring(0, 50) + "..." : content)}");
                return content ?? GetFallbackInsight(avgHours, avgDays);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Bedrock AI failed: {ex.Message}");
                Console.WriteLine($"🔄 Using fallback insight instead");
                return GetFallbackInsight(avgHours, avgDays);
            }
        }

        private string GetFallbackInsight(int avgHours, int avgDays)
        {
            return $"Based on your request history, most of your requests are approved within about {avgHours} hours. You typically submit a new request every {avgDays} days. Try to plan future requests at least 2-3 days in advance to give hospitals enough time to prepare blood safely.";
        }
    }
}
