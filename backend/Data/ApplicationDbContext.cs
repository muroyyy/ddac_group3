using Microsoft.EntityFrameworkCore;

namespace BloodLine.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

    // Add your DbSets here
    // public DbSet<User> Users { get; set; }
    // public DbSet<BloodRequest> BloodRequests { get; set; }
}