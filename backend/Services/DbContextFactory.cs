using Microsoft.EntityFrameworkCore;
using BloodLine.Data;

namespace BloodLine.Services;

public class DbContextFactory : IDbContextFactory<ApplicationDbContext>
{
    private readonly DatabaseService _databaseService;

    public DbContextFactory(DatabaseService databaseService)
    {
        _databaseService = databaseService;
    }

    public ApplicationDbContext CreateDbContext()
    {
        var credentials = _databaseService.GetDatabaseCredentialsAsync().Result;
        var connectionString = $"Server={credentials.endpoint};Database={credentials.database};User={credentials.username};Password={credentials.password};";
        
        var optionsBuilder = new DbContextOptionsBuilder<ApplicationDbContext>();
        optionsBuilder.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString));
        
        return new ApplicationDbContext(optionsBuilder.Options);
    }
}