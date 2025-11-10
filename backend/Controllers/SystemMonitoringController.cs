using Microsoft.AspNetCore.Mvc;
using Amazon.CloudWatch;
using Amazon.CloudWatch.Model;
using Amazon.EC2;
using Amazon.EC2.Model;
using Amazon.RDS;
using Amazon.RDS.Model;

namespace BloodLine.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SystemMonitoringController : ControllerBase
{
    private readonly ILogger<SystemMonitoringController> _logger;
    private const string EC2_INSTANCE_ID = "i-04b9defc7f7f5c03c";
    private const string RDS_INSTANCE_ID = "dev-bloodline-rds";
    private const string AWS_REGION = "ap-southeast-1";

    public SystemMonitoringController(ILogger<SystemMonitoringController> logger)
    {
        _logger = logger;
    }

    [HttpGet("metrics")]
    public async Task<ActionResult<object>> GetSystemMetrics()
    {
        try
        {
            var ec2Metrics = await GetEC2Metrics();
            var rdsMetrics = await GetRDSMetrics();

            return Ok(new
            {
                ec2 = ec2Metrics,
                rds = rdsMetrics,
                timestamp = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving system metrics");
            return StatusCode(500, new { message = "Failed to retrieve metrics" });
        }
    }

    private async Task<object> GetEC2Metrics()
    {
        try
        {
            using var cloudWatchClient = new AmazonCloudWatchClient(Amazon.RegionEndpoint.GetBySystemName(AWS_REGION));
            
            var endTime = DateTime.UtcNow;
            var startTime = endTime.AddMinutes(-5);

            // CPU Utilization
            var cpuRequest = new GetMetricStatisticsRequest
            {
                Namespace = "AWS/EC2",
                MetricName = "CPUUtilization",
                Dimensions = new List<Dimension>
                {
                    new Dimension { Name = "InstanceId", Value = EC2_INSTANCE_ID }
                },
                StartTimeUtc = startTime,
                EndTimeUtc = endTime,
                Period = 300,
                Statistics = new List<string> { "Average" }
            };

            var cpuResponse = await cloudWatchClient.GetMetricStatisticsAsync(cpuRequest);
            var cpuUtilization = cpuResponse.Datapoints.Any() 
                ? cpuResponse.Datapoints.OrderByDescending(d => d.Timestamp).First().Average 
                : 0;

            // Network In
            var networkInRequest = new GetMetricStatisticsRequest
            {
                Namespace = "AWS/EC2",
                MetricName = "NetworkIn",
                Dimensions = new List<Dimension>
                {
                    new Dimension { Name = "InstanceId", Value = EC2_INSTANCE_ID }
                },
                StartTimeUtc = startTime,
                EndTimeUtc = endTime,
                Period = 300,
                Statistics = new List<string> { "Sum" }
            };

            var networkInResponse = await cloudWatchClient.GetMetricStatisticsAsync(networkInRequest);
            var networkIn = networkInResponse.Datapoints.Any()
                ? networkInResponse.Datapoints.OrderByDescending(d => d.Timestamp).First().Sum / 1024 / 1024 // Convert to MB
                : 0;

            return new
            {
                instanceId = EC2_INSTANCE_ID,
                cpuUtilization = Math.Round(cpuUtilization, 2),
                networkIn = Math.Round(networkIn, 2),
                status = "running"
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving EC2 metrics");
            return new
            {
                instanceId = EC2_INSTANCE_ID,
                cpuUtilization = 0,
                networkIn = 0,
                status = "unknown",
                error = ex.Message
            };
        }
    }

    private async Task<object> GetRDSMetrics()
    {
        try
        {
            using var cloudWatchClient = new AmazonCloudWatchClient(Amazon.RegionEndpoint.GetBySystemName(AWS_REGION));
            
            var endTime = DateTime.UtcNow;
            var startTime = endTime.AddMinutes(-5);

            // CPU Utilization
            var cpuRequest = new GetMetricStatisticsRequest
            {
                Namespace = "AWS/RDS",
                MetricName = "CPUUtilization",
                Dimensions = new List<Dimension>
                {
                    new Dimension { Name = "DBInstanceIdentifier", Value = RDS_INSTANCE_ID }
                },
                StartTimeUtc = startTime,
                EndTimeUtc = endTime,
                Period = 300,
                Statistics = new List<string> { "Average" }
            };

            var cpuResponse = await cloudWatchClient.GetMetricStatisticsAsync(cpuRequest);
            var cpuUtilization = cpuResponse.Datapoints.Any()
                ? cpuResponse.Datapoints.OrderByDescending(d => d.Timestamp).First().Average
                : 0;

            // Database Connections
            var connectionsRequest = new GetMetricStatisticsRequest
            {
                Namespace = "AWS/RDS",
                MetricName = "DatabaseConnections",
                Dimensions = new List<Dimension>
                {
                    new Dimension { Name = "DBInstanceIdentifier", Value = RDS_INSTANCE_ID }
                },
                StartTimeUtc = startTime,
                EndTimeUtc = endTime,
                Period = 300,
                Statistics = new List<string> { "Average" }
            };

            var connectionsResponse = await cloudWatchClient.GetMetricStatisticsAsync(connectionsRequest);
            var connections = connectionsResponse.Datapoints.Any()
                ? connectionsResponse.Datapoints.OrderByDescending(d => d.Timestamp).First().Average
                : 0;

            // Free Storage Space
            var storageRequest = new GetMetricStatisticsRequest
            {
                Namespace = "AWS/RDS",
                MetricName = "FreeStorageSpace",
                Dimensions = new List<Dimension>
                {
                    new Dimension { Name = "DBInstanceIdentifier", Value = RDS_INSTANCE_ID }
                },
                StartTimeUtc = startTime,
                EndTimeUtc = endTime,
                Period = 300,
                Statistics = new List<string> { "Average" }
            };

            var storageResponse = await cloudWatchClient.GetMetricStatisticsAsync(storageRequest);
            var freeStorage = storageResponse.Datapoints.Any()
                ? storageResponse.Datapoints.OrderByDescending(d => d.Timestamp).First().Average / 1024 / 1024 / 1024 // Convert to GB
                : 0;

            return new
            {
                instanceId = RDS_INSTANCE_ID,
                cpuUtilization = Math.Round(cpuUtilization, 2),
                connections = Math.Round(connections, 0),
                freeStorageGB = Math.Round(freeStorage, 2),
                status = "available"
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving RDS metrics");
            return new
            {
                instanceId = RDS_INSTANCE_ID,
                cpuUtilization = 0,
                connections = 0,
                freeStorageGB = 0,
                status = "unknown",
                error = ex.Message
            };
        }
    }
}
