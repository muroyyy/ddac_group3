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
    public DbSet<UserDocument> UserDocuments { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(entity =>
        {
            entity.ToTable("users");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Email).IsUnique();
            entity.Property(e => e.Role).HasConversion<string>();
            entity.Property(e => e.Status).HasConversion<string>();
            entity.Property(e => e.VerificationStatus).HasConversion<string>();
            entity.HasMany(e => e.Documents)
                  .WithOne(e => e.User)
                  .HasForeignKey(e => e.UserId);
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

        // Explicit mapping for BloodRequest to ensure EF Core maps to the exact MySQL schema
        modelBuilder.Entity<BloodRequest>(entity =>
        {
            entity.ToTable("blood_requests");

            // Primary key
            entity.HasKey(e => e.RequestId);
            entity.Property(e => e.RequestId).HasColumnName("request_id");

            // Columns (snake_case names matching DB)
            entity.Property(e => e.PatientId).HasColumnName("patient_id");
            entity.Property(e => e.HospitalId).HasColumnName("hospital_id");
            entity.Property(e => e.BloodType).HasColumnName("blood_type").HasMaxLength(5).HasColumnType("varchar(5)");
            entity.Property(e => e.UnitsRequired).HasColumnName("units_required");

            // Map enum-like fields as strings in the DB to avoid enum conversion issues
            entity.Property(e => e.Status).HasColumnName("status").HasConversion<string>().HasMaxLength(20);
            entity.Property(e => e.UrgencyLevel).HasColumnName("urgency_level").HasConversion<string>().HasMaxLength(20);

            entity.Property(e => e.CreatedAt).HasColumnName("created_at");
        });

        modelBuilder.Entity<AnalyticsLog>(entity =>
        {
            entity.ToTable("analytics_log");
            entity.HasKey(e => e.LogId);
            entity.HasOne(e => e.User)
                  .WithMany()
                  .HasForeignKey(e => e.PerformedBy)
                  .OnDelete(DeleteBehavior.SetNull);
        });
        
        modelBuilder.Entity<UserDocument>(entity =>
        {
            entity.ToTable("user_documents");
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.User)
                  .WithMany(e => e.Documents)
                  .HasForeignKey(e => e.UserId);
        });
    }
}