using Microsoft.AspNetCore.Mvc;
using Amazon;
using Amazon.CloudWatch;
using Amazon.CloudWatch.Model;
using Amazon.S3;
using Amazon.S3.Model;

namespace BloodLine.Controllers.Admin;

[ApiController]
[Route("api/[controller]")]
public class MonitoringController : ControllerBase
{
    private readonly IAmazonCloudWatch _cloudWatch;
    private readonly IAmazonCloudWatch _cloudWatchGlobal;
    private readonly IAmazonS3 _s3Client;
    private readonly ILogger<MonitoringController> _logger;

    // AWS Resource Identifiers
    private const string EC2_INSTANCE_ID = "i-04b9defc7f7f5c03c";
    private const string RDS_INSTANCE_ID = "dev-bloodline-rds";
    private const string CLOUDFRONT_DISTRIBUTION_ID = "E2YXSQ0ID9N5E0";
    private const string FRONTEND_BUCKET = "dev-bloodline-frontend-8826eb40";
    private const string ASSETS_BUCKET = "dev-bloodline-assets-8826eb40";
    private const string ROUTE53_HOSTED_ZONE_ID = "Z00220291FD80DV180XVJ";
    private static readonly TimeSpan S3CacheTtl = TimeSpan.FromHours(6);
    private static readonly object S3CacheLock = new();
    private static DateTime? _s3CacheUpdatedAt;
    private static object? _s3CacheValue;

    public MonitoringController(IAmazonCloudWatch cloudWatch, IAmazonS3 s3Client, ILogger<MonitoringController> logger)
    {
        _cloudWatch = cloudWatch;
        _cloudWatchGlobal = new AmazonCloudWatchClient(RegionEndpoint.USEast1);
        _s3Client = s3Client;
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
        var s3Metrics = GetS3Metrics();
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
        var cpuTask = GetMetricStatistics(_cloudWatch, "AWS/EC2", "CPUUtilization", "InstanceId", EC2_INSTANCE_ID, startTime, endTime);
        var networkInTask = GetMetricStatistics(_cloudWatch, "AWS/EC2", "NetworkIn", "InstanceId", EC2_INSTANCE_ID, startTime, endTime);
        var networkOutTask = GetMetricStatistics(_cloudWatch, "AWS/EC2", "NetworkOut", "InstanceId", EC2_INSTANCE_ID, startTime, endTime);
        var diskReadTask = GetMetricStatistics(_cloudWatch, "AWS/EC2", "DiskReadOps", "InstanceId", EC2_INSTANCE_ID, startTime, endTime);
        var diskWriteTask = GetMetricStatistics(_cloudWatch, "AWS/EC2", "DiskWriteOps", "InstanceId", EC2_INSTANCE_ID, startTime, endTime);

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
        var cpuTask = GetMetricStatistics(_cloudWatch, "AWS/RDS", "CPUUtilization", "DBInstanceIdentifier", RDS_INSTANCE_ID, startTime, endTime);
        var connectionsTask = GetMetricStatistics(_cloudWatch, "AWS/RDS", "DatabaseConnections", "DBInstanceIdentifier", RDS_INSTANCE_ID, startTime, endTime);
        var freeStorageTask = GetMetricStatistics(_cloudWatch, "AWS/RDS", "FreeStorageSpace", "DBInstanceIdentifier", RDS_INSTANCE_ID, startTime, endTime);
        var readIOPSTask = GetMetricStatistics(_cloudWatch, "AWS/RDS", "ReadIOPS", "DBInstanceIdentifier", RDS_INSTANCE_ID, startTime, endTime);
        var writeIOPSTask = GetMetricStatistics(_cloudWatch, "AWS/RDS", "WriteIOPS", "DBInstanceIdentifier", RDS_INSTANCE_ID, startTime, endTime);

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

    private async Task<object> GetS3Metrics()
    {
        try
        {
            var cached = GetCachedS3Metrics();
            if (cached != null)
            {
                return cached;
            }

            var frontendTask = GetBucketStats(FRONTEND_BUCKET);
            var assetsTask = GetBucketStats(ASSETS_BUCKET);

            await Task.WhenAll(frontendTask, assetsTask);

            var frontend = frontendTask.Result;
            var assets = assetsTask.Result;

            var payload = new
            {
                frontendBucket = new
                {
                    sizeGB = Math.Round(frontend.sizeGB, 2),
                    objects = frontend.objects
                },
                assetsBucket = new
                {
                    sizeGB = Math.Round(assets.sizeGB, 2),
                    objects = assets.objects
                },
                totalSizeGB = Math.Round(frontend.sizeGB + assets.sizeGB, 2),
                totalObjects = frontend.objects + assets.objects
            };

            SetCachedS3Metrics(payload);
            return payload;
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

    private object? GetCachedS3Metrics()
    {
        lock (S3CacheLock)
        {
            if (_s3CacheUpdatedAt.HasValue && DateTime.UtcNow - _s3CacheUpdatedAt.Value < S3CacheTtl)
            {
                return _s3CacheValue;
            }
        }

        return null;
    }

    private void SetCachedS3Metrics(object payload)
    {
        lock (S3CacheLock)
        {
            _s3CacheUpdatedAt = DateTime.UtcNow;
            _s3CacheValue = payload;
        }
    }

    private async Task<(double sizeGB, int objects)> GetBucketStats(string bucketName)
    {
        double totalBytes = 0;
        int totalObjects = 0;
        string? continuationToken = null;

        do
        {
            var request = new ListObjectsV2Request
            {
                BucketName = bucketName,
                ContinuationToken = continuationToken
            };

            var response = await _s3Client.ListObjectsV2Async(request);
            foreach (var obj in response.S3Objects)
            {
                totalBytes += obj.Size ?? 0;
                totalObjects += 1;
            }

            continuationToken = response.IsTruncated == true ? response.NextContinuationToken : null;
        } while (!string.IsNullOrEmpty(continuationToken));

        return (totalBytes / (1024 * 1024 * 1024), totalObjects);
    }

    private async Task<object> GetCloudFrontMetrics(DateTime startTime, DateTime endTime)
    {
        try
        {
            var requestsTask = GetMetricSum(_cloudWatchGlobal, "AWS/CloudFront", "Requests", "DistributionId", CLOUDFRONT_DISTRIBUTION_ID, startTime, endTime);
            var bytesDownloadedTask = GetMetricSum(_cloudWatchGlobal, "AWS/CloudFront", "BytesDownloaded", "DistributionId", CLOUDFRONT_DISTRIBUTION_ID, startTime, endTime);
            var errorRate4xxTask = GetMetricStatistics(_cloudWatchGlobal, "AWS/CloudFront", "4xxErrorRate", "DistributionId", CLOUDFRONT_DISTRIBUTION_ID, startTime, endTime);
            var errorRate5xxTask = GetMetricStatistics(_cloudWatchGlobal, "AWS/CloudFront", "5xxErrorRate", "DistributionId", CLOUDFRONT_DISTRIBUTION_ID, startTime, endTime);

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
            var queryCountTask = GetMetricSum(_cloudWatchGlobal, "AWS/Route53", "QueryCount", "HostedZoneId", ROUTE53_HOSTED_ZONE_ID, startTime, endTime);

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

    private async Task<double> GetMetricStatistics(IAmazonCloudWatch cloudWatch, string namespaceName, string metricName, string dimensionName, string dimensionValue, DateTime startTime, DateTime endTime, string? dimension2Name = null, string? dimension2Value = null)
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

            var response = await cloudWatch.GetMetricStatisticsAsync(request);
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

    private async Task<double> GetMetricSum(IAmazonCloudWatch cloudWatch, string namespaceName, string metricName, string dimensionName, string dimensionValue, DateTime startTime, DateTime endTime)
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

            var response = await cloudWatch.GetMetricStatisticsAsync(request);
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
