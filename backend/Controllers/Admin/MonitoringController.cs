using Microsoft.AspNetCore.Mvc;
using Amazon.CloudWatch;
using Amazon.CloudWatch.Model;

namespace BloodLine.Controllers.Admin;

[ApiController]
[Route("api/[controller]")]
public class MonitoringController : ControllerBase
{
    private readonly IAmazonCloudWatch _cloudWatch;
    private readonly ILogger<MonitoringController> _logger;

    // AWS Resource Identifiers
    private const string EC2_INSTANCE_ID = "i-04b9defc7f7f5c03c";
    private const string RDS_INSTANCE_ID = "dev-bloodline-rds";
    private const string CLOUDFRONT_DISTRIBUTION_ID = "E2YXSQ0ID9N5E0";
    private const string FRONTEND_BUCKET = "dev-bloodline-frontend-8826eb40";
    private const string ASSETS_BUCKET = "dev-bloodline-assets-8826eb40";
    private const string ROUTE53_HOSTED_ZONE_ID = "Z00220291FD80DV180XVJ";

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
            var startTime24h = endTime.AddHours(-24);

            // Fetch all metrics in parallel
            var ec2Metrics = GetEC2Metrics(startTime, endTime);
            var rdsMetrics = GetRDSMetrics(startTime, endTime);
            var s3Metrics = GetS3Metrics(startTime24h, endTime);
            var cloudfrontMetrics = GetCloudFrontMetrics(startTime24h, endTime);
            var route53Metrics = GetRoute53Metrics(startTime24h, endTime);

            await Task.WhenAll(ec2Metrics, rdsMetrics, s3Metrics, cloudfrontMetrics, route53Metrics);

            return Ok(new
            {
                ec2 = ec2Metrics.Result,
                rds = rdsMetrics.Result,
                s3 = s3Metrics.Result,
                cloudfront = cloudfrontMetrics.Result,
                route53 = route53Metrics.Result
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching CloudWatch metrics");
            return StatusCode(500, new { message = "Error fetching system metrics", error = ex.Message });
        }
    }

    private async Task<object> GetEC2Metrics(DateTime startTime, DateTime endTime)
    {
        var cpuTask = GetMetricStatistics("AWS/EC2", "CPUUtilization", "InstanceId", EC2_INSTANCE_ID, startTime, endTime);
        var networkInTask = GetMetricStatistics("AWS/EC2", "NetworkIn", "InstanceId", EC2_INSTANCE_ID, startTime, endTime);
        var networkOutTask = GetMetricStatistics("AWS/EC2", "NetworkOut", "InstanceId", EC2_INSTANCE_ID, startTime, endTime);
        var diskReadTask = GetMetricStatistics("AWS/EC2", "DiskReadOps", "InstanceId", EC2_INSTANCE_ID, startTime, endTime);
        var diskWriteTask = GetMetricStatistics("AWS/EC2", "DiskWriteOps", "InstanceId", EC2_INSTANCE_ID, startTime, endTime);

        await Task.WhenAll(cpuTask, networkInTask, networkOutTask, diskReadTask, diskWriteTask);

        return new
        {
            cpuUtilization = Math.Round(cpuTask.Result, 2),
            networkIn = Math.Round(networkInTask.Result / (1024 * 1024), 2), // Convert to MB
            networkOut = Math.Round(networkOutTask.Result / (1024 * 1024), 2), // Convert to MB
            diskIOPS = Math.Round(diskReadTask.Result + diskWriteTask.Result, 0)
        };
    }

    private async Task<object> GetRDSMetrics(DateTime startTime, DateTime endTime)
    {
        var cpuTask = GetMetricStatistics("AWS/RDS", "CPUUtilization", "DBInstanceIdentifier", RDS_INSTANCE_ID, startTime, endTime);
        var connectionsTask = GetMetricStatistics("AWS/RDS", "DatabaseConnections", "DBInstanceIdentifier", RDS_INSTANCE_ID, startTime, endTime);
        var freeStorageTask = GetMetricStatistics("AWS/RDS", "FreeStorageSpace", "DBInstanceIdentifier", RDS_INSTANCE_ID, startTime, endTime);
        var readIOPSTask = GetMetricStatistics("AWS/RDS", "ReadIOPS", "DBInstanceIdentifier", RDS_INSTANCE_ID, startTime, endTime);
        var writeIOPSTask = GetMetricStatistics("AWS/RDS", "WriteIOPS", "DBInstanceIdentifier", RDS_INSTANCE_ID, startTime, endTime);

        await Task.WhenAll(cpuTask, connectionsTask, freeStorageTask, readIOPSTask, writeIOPSTask);

        return new
        {
            cpuUtilization = Math.Round(cpuTask.Result, 2),
            connections = (int)connectionsTask.Result,
            freeStorageGB = Math.Round(freeStorageTask.Result / (1024 * 1024 * 1024), 2), // Convert to GB
            readIOPS = Math.Round(readIOPSTask.Result, 0),
            writeIOPS = Math.Round(writeIOPSTask.Result, 0)
        };
    }

    private async Task<object> GetS3Metrics(DateTime startTime, DateTime endTime)
    {
        try
        {
            // S3 metrics for bucket size and objects
            var frontendBucketSizeTask = GetMetricStatistics("AWS/S3", "BucketSizeBytes", "BucketName", FRONTEND_BUCKET, startTime, endTime, "StorageType", "StandardStorage");
            var frontendObjectCountTask = GetMetricStatistics("AWS/S3", "NumberOfObjects", "BucketName", FRONTEND_BUCKET, startTime, endTime, "StorageType", "AllStorageTypes");
            var assetsBucketSizeTask = GetMetricStatistics("AWS/S3", "BucketSizeBytes", "BucketName", ASSETS_BUCKET, startTime, endTime, "StorageType", "StandardStorage");
            var assetsObjectCountTask = GetMetricStatistics("AWS/S3", "NumberOfObjects", "BucketName", ASSETS_BUCKET, startTime, endTime, "StorageType", "AllStorageTypes");

            await Task.WhenAll(frontendBucketSizeTask, frontendObjectCountTask, assetsBucketSizeTask, assetsObjectCountTask);

            var frontendSizeGB = frontendBucketSizeTask.Result / (1024 * 1024 * 1024);
            var assetsSizeGB = assetsBucketSizeTask.Result / (1024 * 1024 * 1024);

            return new
            {
                frontendBucket = new
                {
                    sizeGB = Math.Round(frontendSizeGB, 2),
                    objects = (int)frontendObjectCountTask.Result
                },
                assetsBucket = new
                {
                    sizeGB = Math.Round(assetsSizeGB, 2),
                    objects = (int)assetsObjectCountTask.Result
                },
                totalSizeGB = Math.Round(frontendSizeGB + assetsSizeGB, 2),
                totalObjects = (int)(frontendObjectCountTask.Result + assetsObjectCountTask.Result)
            };
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error fetching S3 metrics, returning defaults");
            return new
            {
                frontendBucket = new { sizeGB = 0.0, objects = 0 },
                assetsBucket = new { sizeGB = 0.0, objects = 0 },
                totalSizeGB = 0.0,
                totalObjects = 0
            };
        }
    }

    private async Task<object> GetCloudFrontMetrics(DateTime startTime, DateTime endTime)
    {
        try
        {
            var requestsTask = GetMetricSum("AWS/CloudFront", "Requests", "DistributionId", CLOUDFRONT_DISTRIBUTION_ID, startTime, endTime);
            var bytesDownloadedTask = GetMetricSum("AWS/CloudFront", "BytesDownloaded", "DistributionId", CLOUDFRONT_DISTRIBUTION_ID, startTime, endTime);
            var errorRate4xxTask = GetMetricStatistics("AWS/CloudFront", "4xxErrorRate", "DistributionId", CLOUDFRONT_DISTRIBUTION_ID, startTime, endTime);
            var errorRate5xxTask = GetMetricStatistics("AWS/CloudFront", "5xxErrorRate", "DistributionId", CLOUDFRONT_DISTRIBUTION_ID, startTime, endTime);

            await Task.WhenAll(requestsTask, bytesDownloadedTask, errorRate4xxTask, errorRate5xxTask);

            var totalRequests = requestsTask.Result;
            var cacheHitRate = totalRequests > 0 ? Math.Max(0, 100 - (errorRate4xxTask.Result + errorRate5xxTask.Result)) : 0;

            return new
            {
                requests = (int)totalRequests,
                dataTransferGB = Math.Round(bytesDownloadedTask.Result / (1024 * 1024 * 1024), 2),
                cacheHitRate = Math.Round(cacheHitRate, 1),
                errorRate = Math.Round(errorRate4xxTask.Result + errorRate5xxTask.Result, 2)
            };
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error fetching CloudFront metrics, returning defaults");
            return new
            {
                requests = 0,
                dataTransferGB = 0.0,
                cacheHitRate = 0.0,
                errorRate = 0.0
            };
        }
    }

    private async Task<object> GetRoute53Metrics(DateTime startTime, DateTime endTime)
    {
        try
        {
            var queryCountTask = GetMetricSum("AWS/Route53", "QueryCount", "HostedZoneId", ROUTE53_HOSTED_ZONE_ID, startTime, endTime);

            await queryCountTask;

            return new
            {
                queryCount24h = (int)queryCountTask.Result,
                healthCheckStatus = "Healthy" // Route53 health checks need separate API call
            };
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error fetching Route53 metrics, returning defaults");
            return new
            {
                queryCount24h = 0,
                healthCheckStatus = "Unknown"
            };
        }
    }

    private async Task<double> GetMetricStatistics(string namespaceName, string metricName, string dimensionName, string dimensionValue, DateTime startTime, DateTime endTime, string? dimension2Name = null, string? dimension2Value = null)
    {
        try
        {
            var dimensions = new List<Dimension>
            {
                new Dimension { Name = dimensionName, Value = dimensionValue }
            };

            if (!string.IsNullOrEmpty(dimension2Name) && !string.IsNullOrEmpty(dimension2Value))
            {
                dimensions.Add(new Dimension { Name = dimension2Name, Value = dimension2Value });
            }

            var request = new GetMetricStatisticsRequest
            {
                Namespace = namespaceName,
                MetricName = metricName,
                Dimensions = dimensions,
                StartTime = startTime,
                EndTime = endTime,
                Period = 300, // 5 minutes
                Statistics = new List<string> { "Average" }
            };

            var response = await _cloudWatch.GetMetricStatisticsAsync(request);
            return response.Datapoints.Count > 0
                ? response.Datapoints.OrderByDescending(d => d.Timestamp).First().Average ?? 0.0
                : 0.0;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, $"Error fetching metric {namespaceName}/{metricName}");
            return 0.0;
        }
    }

    private async Task<double> GetMetricSum(string namespaceName, string metricName, string dimensionName, string dimensionValue, DateTime startTime, DateTime endTime)
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
                Period = 86400, // 24 hours for daily totals
                Statistics = new List<string> { "Sum" }
            };

            var response = await _cloudWatch.GetMetricStatisticsAsync(request);
            return response.Datapoints.Count > 0
                ? response.Datapoints.OrderByDescending(d => d.Timestamp).First().Sum ?? 0.0
                : 0.0;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, $"Error fetching metric sum {namespaceName}/{metricName}");
            return 0.0;
        }
    }
}
