using BloodLine.Data;
using BloodLine.Services;
using Microsoft.EntityFrameworkCore;
using Amazon.SecretsManager;

var builder = WebApplication.CreateBuilder(args);

// Add AWS Services
builder.Services.AddAWSService<IAmazonSecretsManager>();
builder.Services.AddScoped<DatabaseService>();

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "http://dev-bloodline-frontend-8826eb40.s3-website-ap-southeast-1.amazonaws.com")
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

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseCors("AllowFrontend");
app.UseRouting();

app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.Run();
