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
        policy.WithOrigins("http://localhost:3000", "https://your-s3-bucket-url")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Add services to the container.
builder.Services.AddDbContext<ApplicationDbContext>((serviceProvider, options) =>
{
    // Use a simple connection string for now - will be updated at runtime
    var connectionString = "Server=localhost;Database=bloodline;User=admin;Password=temp;";
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString));
});

// Configure database connection at runtime
builder.Services.AddScoped<IDbContextFactory<ApplicationDbContext>>(provider =>
{
    return new DbContextFactory(provider.GetRequiredService<DatabaseService>());
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
