using BloodLine.Data;
using BloodLine.Services;
using Microsoft.EntityFrameworkCore;
using Amazon.SecretsManager;

var builder = WebApplication.CreateBuilder(args);

// Add AWS Services
builder.Services.AddAWSService<IAmazonSecretsManager>();
builder.Services.AddScoped<SecretsManagerService>();

// Add services to the container.
builder.Services.AddDbContext<ApplicationDbContext>((serviceProvider, options) =>
{
    var secretsService = serviceProvider.GetRequiredService<SecretsManagerService>();
    var configuration = serviceProvider.GetRequiredService<IConfiguration>();
    var secretName = configuration["AWS:SecretName"]!;
    var connectionString = secretsService.GetConnectionStringAsync(secretName).Result;
    
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

app.UseRouting();

app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.Run();
