using Amazon.SecretsManager;
using Amazon.SecretsManager.Model;
using System.Text.Json;

namespace BloodLine.Services;

public class DatabaseService
{
    private readonly IAmazonSecretsManager _secretsManager;
    private readonly ILogger<DatabaseService> _logger;

    public DatabaseService(IAmazonSecretsManager secretsManager, ILogger<DatabaseService> logger)
    {
        _secretsManager = secretsManager;
        _logger = logger;
    }

    public async Task<DatabaseCredentials> GetDatabaseCredentialsAsync()
    {
        try
        {
            var secretName = Environment.GetEnvironmentVariable("DB_SECRET_NAME") ?? "dev-bloodline-db-credentials";
            
            var request = new GetSecretValueRequest
            {
                SecretId = secretName
            };

            var response = await _secretsManager.GetSecretValueAsync(request);
            var credentials = JsonSerializer.Deserialize<DatabaseCredentials>(response.SecretString);
            
            return credentials ?? throw new InvalidOperationException("Failed to deserialize database credentials");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to retrieve database credentials from Secrets Manager");
            throw;
        }
    }
}

public class DatabaseCredentials
{
    public string endpoint { get; set; } = string.Empty;
    public string username { get; set; } = string.Empty;
    public string password { get; set; } = string.Empty;
    public string database { get; set; } = string.Empty;
}