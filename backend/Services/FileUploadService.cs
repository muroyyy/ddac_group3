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
    private readonly IConfiguration _configuration;
    private readonly ILogger<FileUploadService> _logger;
    private readonly string _bucketName;

    public FileUploadService(IAmazonS3 s3Client, IConfiguration configuration, ILogger<FileUploadService> logger)
    {
        _s3Client = s3Client;
        _configuration = configuration;
        _logger = logger;
        _bucketName = _configuration["AWS:S3:BucketName"] ?? "bloodline-documents";
    }

    public async Task<string> UploadFileAsync(IFormFile file, string userId, string documentType)
    {
        try
        {
            var fileExtension = Path.GetExtension(file.FileName);
            var fileName = $"{userId}_{documentType}_{DateTime.UtcNow:yyyyMMdd_HHmmss}{fileExtension}";
            var key = $"documents/{userId}/{fileName}";

            using var stream = file.OpenReadStream();
            var request = new PutObjectRequest
            {
                BucketName = _bucketName,
                Key = key,
                InputStream = stream,
                ContentType = file.ContentType,
                ServerSideEncryptionMethod = ServerSideEncryptionMethod.AES256
            };

            await _s3Client.PutObjectAsync(request);
            return key;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading file to S3");
            throw;
        }
    }

    public async Task<bool> DeleteFileAsync(string filePath)
    {
        try
        {
            var request = new DeleteObjectRequest
            {
                BucketName = _bucketName,
                Key = filePath
            };

            await _s3Client.DeleteObjectAsync(request);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting file from S3");
            return false;
        }
    }
}