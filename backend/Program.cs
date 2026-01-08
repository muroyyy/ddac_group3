using BloodLine.Data;
using BloodLine.Services;
using Microsoft.EntityFrameworkCore;
using Amazon.SecretsManager;
using Amazon.CloudWatch;
using Amazon.SimpleNotificationService;
using Amazon.Runtime;
using Amazon;
// using Amazon.S3;

var builder = WebApplication.CreateBuilder(args);

// Configureee to listen on port 5000
builder.WebHost.UseUrls("http://*:5000");

// Get AWS Regionn from configuration
var awsRegion = builder.Configuration["AWS:Region"] ?? "ap-southeast-1";
var regionEndpoint = RegionEndpoint.GetBySystemName(awsRegion);

// Add AWS Services
builder.Services.AddSingleton<IAmazonSecretsManager>(new AmazonSecretsManagerClient(regionEndpoint));
builder.Services.AddSingleton<IAmazonCloudWatch>(new AmazonCloudWatchClient(regionEndpoint));
builder.Services.AddSingleton<IAmazonSimpleNotificationService>(new AmazonSimpleNotificationServiceClient(regionEndpoint));

// builder.Services.AddAWSService<IAmazonS3>();
builder.Services.AddScoped<DatabaseService>();
builder.Services.AddScoped<IAuditLogService, AuditLogService>();
builder.Services.AddScoped<IFileUploadService, FileUploadService>();
builder.Services.AddScoped<DatabaseMigrationService>();
builder.Services.AddScoped<NotificationService>();
builder.Services.AddScoped<ISNSService, SNSService>();

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
                "http://localhost:3000", 
                "http://dev-bloodline-frontend-8826eb40.s3-website-ap-southeast-1.amazonaws.com",
                "https://bloodline.dev",
                "https://www.bloodline.dev"
            )
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Add services to the container.
builder.Services.AddDbContext<ApplicationDbContext>((serviceProvider, options) =>
{
    // Get database credentials from AWS Secrets Manager
    var databaseService = serviceProvider.GetRequiredService<DatabaseService>();
    var credentials = databaseService.GetDatabaseCredentialsAsync().GetAwaiter().GetResult();
    
    // Parse endpoint to separate hostname and port
    var endpointParts = credentials.endpoint.Split(':');
    var server = endpointParts[0];
    var port = endpointParts.Length > 1 ? endpointParts[1] : "3306";
    
    var connectionString = $"Server={server};Port={port};Database={credentials.database};User={credentials.username};Password={credentials.password};";
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString));
});

builder.Services.AddControllersWithViews();

var app = builder.Build();

// Run database migrations
using (var scope = app.Services.CreateScope())
{
    var migrationService = scope.ServiceProvider.GetRequiredService<DatabaseMigrationService>();
    await migrationService.EnsureBloodRequestsTableAsync();
}

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

// Disable HTTPS redirect for API-only deployment
// app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseCors("AllowFrontend");
app.UseRouting();

app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.Run();
