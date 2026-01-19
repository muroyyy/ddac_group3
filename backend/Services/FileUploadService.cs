using Amazon.S3;
using Amazon.S3.Model;

namespace BloodLine.Services;

public interface IFileUploadService
{
    Task<string> UploadFileAsync(IFormFile file, string userId, string documentType);
    Task<bool> DeleteFileAsync(string filePath);
}

public class FileUploadService : IFileUploadService
{
    private readonly IAmazonS3 _s3Client;
    private readonly ILogger<FileUploadService> _logger;
    private const string BucketName = "dev-bloodline-assets-8826eb40";

    public FileUploadService(IAmazonS3 s3Client, ILogger<FileUploadService> logger)
    {
        _s3Client = s3Client;
        _logger = logger;
    }

    public async Task<string> UploadFileAsync(IFormFile file, string userId, string documentType)
    {
        var fileName = $"{userId}_{documentType}_{DateTime.UtcNow:yyyyMMdd_HHmmss}_{file.FileName}";
        var key = $"documents/{fileName}";
        
        using (var stream = file.OpenReadStream())
        {
            var request = new PutObjectRequest
            {
                BucketName = BucketName,
                Key = key,
                InputStream = stream,
                ContentType = file.ContentType
            };
            
            await _s3Client.PutObjectAsync(request);
        }
        
        _logger.LogInformation($"File uploaded to S3: {key}");
        return key;
    }

    public async Task<bool> DeleteFileAsync(string filePath)
    {
        try
        {
            var request = new DeleteObjectRequest
            {
                BucketName = BucketName,
                Key = filePath
            };
            
            await _s3Client.DeleteObjectAsync(request);
            _logger.LogInformation($"File deleted from S3: {filePath}");
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error deleting file from S3: {filePath}");
            return false;
        }
    }
}