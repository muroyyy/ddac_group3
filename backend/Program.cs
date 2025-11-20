using BloodLine.Data;
using BloodLine.Models;
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
if (builder.Environment.IsDevelopment())
{
    // Use local MySQL connection string in development
    var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
    builder.Services.AddDbContext<ApplicationDbContext>(options =>
        options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));
}
else
{
    // Use AWS Secrets Manager in production
    builder.Services.AddDbContext<ApplicationDbContext>((serviceProvider, options) =>
    {
        var databaseService = serviceProvider.GetRequiredService<DatabaseService>();
        var credentials = databaseService.GetDatabaseCredentialsAsync().GetAwaiter().GetResult();
        
        var endpointParts = credentials.endpoint.Split(':');
        var server = endpointParts[0];
        var port = endpointParts.Length > 1 ? endpointParts[1] : "3306";
        
        var connectionString = $"Server={server};Port={port};Database={credentials.database};User={credentials.username};Password={credentials.password};";
        options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString));
    });
}

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

// Seed demo donor account
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
    
    try
    {
        // Check if demo donor exists
        var demoEmail = "donor@demo.com";
        var demoUser = await context.Users.FirstOrDefaultAsync(u => u.Email == demoEmail);
        
        if (demoUser == null)
        {
            // Create demo donor user
            demoUser = new User
            {
                FullName = "Demo Donor",
                Email = demoEmail,
                Phone = "+60123456789",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123", 12),
                Role = UserRole.Donor,
                Status = UserStatus.Active
            };
            context.Users.Add(demoUser);
            await context.SaveChangesAsync();
            
            // Create donor profile
            var donorProfile = new DonorProfile
            {
                UserId = demoUser.Id,
                BloodType = "O+",
                Location = "Kuala Lumpur",
                IsAvailable = true
            };
            context.DonorProfiles.Add(donorProfile);
            await context.SaveChangesAsync();
            
            logger.LogInformation("Demo donor account created: {Email} / password123", demoEmail);
        }
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Error seeding demo donor account");
    }
}
app.UseRouting();

app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.Run();
