using Microsoft.AspNetCore.Mvc;
using Amazon.CloudWatch;
using Amazon.CloudWatch.Model;

namespace BloodLine.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MonitoringController : ControllerBase
{
    private readonly IAmazonCloudWatch _cloudWatch;
    private readonly ILogger<MonitoringController> _logger;
    private const string EC2_INSTANCE_ID = "i-04b9defc7f7f5c03c";
    private const string RDS_INSTANCE_ID = "dev-bloodline-rds";

    public MonitoringController(IAmazonCloudWatch cloudWatch, ILogger<MonitoringController> logger)
    {
        _cloudWatch = cloudWatch;
        _logger = logger;
    }

    [HttpGet("metrics")]
    public async Task<ActionResult<object>> GetMetrics()
    {
        try
        {
            var endTime = DateTime.UtcNow;
            var startTime = endTime.AddMinutes(-5);

            var ec2CpuTask = GetMetricStatistics("AWS/EC2", "CPUUtilization", "InstanceId", EC2_INSTANCE_ID, startTime, endTime);
            var ec2NetworkTask = GetMetricStatistics("AWS/EC2", "NetworkIn", "InstanceId", EC2_INSTANCE_ID, startTime, endTime);
            var rdsCpuTask = GetMetricStatistics("AWS/RDS", "CPUUtilization", "DBInstanceIdentifier", RDS_INSTANCE_ID, startTime, endTime);
            var rdsConnectionsTask = GetMetricStatistics("AWS/RDS", "DatabaseConnections", "DBInstanceIdentifier", RDS_INSTANCE_ID, startTime, endTime);
            var rdsFreeStorageTask = GetMetricStatistics("AWS/RDS", "FreeStorageSpace", "DBInstanceIdentifier", RDS_INSTANCE_ID, startTime, endTime);

            await Task.WhenAll(ec2CpuTask, ec2NetworkTask, rdsCpuTask, rdsConnectionsTask, rdsFreeStorageTask);

            return Ok(new
            {
                ec2 = new
                {
                    cpuUtilization = ec2CpuTask.Result,
                    networkIn = ec2NetworkTask.Result / (1024 * 1024)
                },
                rds = new
                {
                    cpuUtilization = rdsCpuTask.Result,
                    connections = (int)rdsConnectionsTask.Result,
                    freeStorageGB = rdsFreeStorageTask.Result / (1024 * 1024 * 1024)
                }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching CloudWatch metrics");
            return Ok(new
            {
                ec2 = new { cpuUtilization = 0.0, networkIn = 0.0 },
                rds = new { cpuUtilization = 0.0, connections = 0, freeStorageGB = 0.0 }
            });
        }
    }

    private async Task<double> GetMetricStatistics(string namespaceName, string metricName, string dimensionName, string dimensionValue, DateTime startTime, DateTime endTime)
    {
        try
        {
            var request = new GetMetricStatisticsRequest
            {
                Namespace = namespaceName,
                MetricName = metricName,
                Dimensions = new List<Dimension>
                {
                    new Dimension { Name = dimensionName, Value = dimensionValue }
                },
                StartTime = startTime,
                EndTime = endTime,
                Period = 300,
                Statistics = new List<string> { "Average" }
            };

            var response = await _cloudWatch.GetMetricStatisticsAsync(request);
            return response.Datapoints.Count > 0 ? response.Datapoints.OrderByDescending(d => d.Timestamp).First().Average ?? 0.0 : 0.0;
        }
        catch
        {
            return 0.0;
        }
    }
}
