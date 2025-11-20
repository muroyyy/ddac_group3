using Amazon.SecretsManager;
using Amazon.SecretsManager.Model;
using System.Text.Json;

namespace BloodLine.Services;

public class SecretsManagerService
{
    private readonly IAmazonSecretsManager _secretsManager;

    public SecretsManagerService(IAmazonSecretsManager secretsManager)
    {
        _secretsManager = secretsManager;
    }

    public async Task<string> GetConnectionStringAsync(string secretName)
    {
        var request = new GetSecretValueRequest { SecretId = secretName };
        var response = await _secretsManager.GetSecretValueAsync(request);
        
        var secret = JsonSerializer.Deserialize<DatabaseSecret>(response.SecretString);
        
        return $"Server={secret.host};Port={secret.port};Database={secret.dbname};Uid={secret.username};Pwd={secret.password};SslMode=Required;";
    }
}

public class DatabaseSecret
{
    public string host { get; set; } = string.Empty;
    public int port { get; set; }
    public string dbname { get; set; } = string.Empty;
    public string username { get; set; } = string.Empty;
    public string password { get; set; } = string.Empty;
}