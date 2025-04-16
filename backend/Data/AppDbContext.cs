using backend.Models.Entities;
using backend.Models.EntityConfigurations;
using Microsoft.EntityFrameworkCore;

namespace backend.Data
{
  public class AppDbContext : DbContext
  {
    public DbSet<Subject> Subjects { get; set; }
    public DbSet<Teacher> Teachers { get; set; }
    public DbSet<TeachingSession> TeachingSessions { get; set; }
    public DbSet<TeachingWeek> TeachingWeeks { get; set; }
    public DbSet<SubjectLog> SubjectLogs { get; set; }
    public DbSet<User> Users { get; set; }

    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
      modelBuilder.ApplyConfiguration(new SubjectConfiguration());
      modelBuilder.ApplyConfiguration(new TeacherConfiguration());
      modelBuilder.ApplyConfiguration(new TeachingSessionConfiguration());
      modelBuilder.ApplyConfiguration(new TeachingWeekConfiguration());
      modelBuilder.ApplyConfiguration(new SubjectLogConfiguration());
      modelBuilder.ApplyConfiguration(new UserConfiguration());

      base.OnModelCreating(modelBuilder);
    }
  }
}