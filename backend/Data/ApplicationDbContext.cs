using Microsoft.EntityFrameworkCore;
using BloodLine.Models;

// Model version: 2.2 - Testing deployment
namespace BloodLine.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

    public DbSet<User> Users { get; set; }
    public DbSet<DonorProfile> DonorProfiles { get; set; }
    public DbSet<PatientProfile> PatientProfiles { get; set; }
    public DbSet<Hospital> Hospitals { get; set; }
    public DbSet<PasswordResetToken> PasswordResetTokens { get; set; }
    public DbSet<AnalyticsLog> AnalyticsLogs { get; set; }
    public DbSet<BloodRequest> BloodRequests { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(entity =>
        {
            entity.ToTable("users");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Email).IsUnique();
            entity.Property(e => e.Role).HasConversion<string>();
            entity.Property(e => e.Status).HasConversion<string>();
        });

      //BloodRequest Table  
        modelBuilder.Entity<DonorProfile>(entity =>
        {
            entity.ToTable("donor_profile");
            entity.HasKey(e => e.DonorId);
            entity.HasIndex(e => e.UserId).IsUnique();
            entity.HasOne(e => e.User)
                  .WithOne()
                  .HasForeignKey<DonorProfile>(e => e.UserId);
        });
        
        modelBuilder.Entity<PatientProfile>(entity =>
        {
            entity.ToTable("patient_profile");
            entity.HasKey(e => e.PatientId);
            entity.HasIndex(e => e.UserId).IsUnique();
            entity.Property(e => e.UrgencyLevel).HasConversion<string>();
            entity.HasOne(e => e.User)
                  .WithOne()
                  .HasForeignKey<PatientProfile>(e => e.UserId);
        });
        


        modelBuilder.Entity<Hospital>(entity =>
        {
            entity.ToTable("hospital");
            entity.HasKey(e => e.HospitalId);
            entity.HasIndex(e => e.UserId).IsUnique();
            entity.HasOne(e => e.User)
                  .WithOne()
                  .HasForeignKey<Hospital>(e => e.UserId);
        });
        
        modelBuilder.Entity<BloodRequest>().ToTable("blood_requests");

        modelBuilder.Entity<AnalyticsLog>(entity =>
        {
            entity.ToTable("analytics_log");
            entity.HasKey(e => e.LogId);
            entity.HasOne(e => e.User)
                  .WithMany()
                  .HasForeignKey(e => e.PerformedBy)
                  .OnDelete(DeleteBehavior.SetNull);
        });
    }
}