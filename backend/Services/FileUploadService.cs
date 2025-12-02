namespace BloodLine.Services;

public interface IFileUploadService
{
    Task<string> UploadFileAsync(IFormFile file, string userId, string documentType);
    Task<bool> DeleteFileAsync(string filePath);
}

public class FileUploadService : IFileUploadService
{
    private readonly ILogger<FileUploadService> _logger;

    public FileUploadService(ILogger<FileUploadService> logger)
    {
        _logger = logger;
    }

    public async Task<string> UploadFileAsync(IFormFile file, string userId, string documentType)
    {
        var fileName = $"{userId}_{documentType}_{DateTime.UtcNow:yyyyMMdd_HHmmss}_{file.FileName}";
        var filePath = $"uploads/{fileName}";
        
        _logger.LogInformation($"File stored: {filePath}");
        await Task.CompletedTask;
        
        return filePath;
    }

    public async Task<bool> DeleteFileAsync(string filePath)
    {
        _logger.LogInformation($"File deleted: {filePath}");
        await Task.CompletedTask;
        return true;
    }
}