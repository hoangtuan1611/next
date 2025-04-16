using backend.Models.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend.Models.EntityConfigurations
{
  public class TeachingSessionConfiguration : IEntityTypeConfiguration<TeachingSession>
  {
    public void Configure(EntityTypeBuilder<TeachingSession> builder)
    {
      builder.ToTable("TeachingSessions");

      builder.HasKey(ts => ts.id);

      builder.Property(ts => ts.DayOfWeek)
        .IsRequired()
        .HasMaxLength(255);

      builder.Property(ts => ts.TimeOfDay)
        .IsRequired()
        .HasMaxLength(255);

      builder.Property(ts => ts.Period)
        .IsRequired()
        .HasMaxLength(255);

      builder.Property(ts => ts.PeriodBegin)
        .IsRequired();

      builder.Property(ts => ts.PeriodEnd)
        .IsRequired();

      builder.Property(ts => ts.TimeBegin)
        .IsRequired();

      builder.Property(ts => ts.TimeEnd)
        .IsRequired();

      builder.Property(ts => ts.TaughtLessons)
        .IsRequired()
        .HasMaxLength(255);

      builder.Property(ts => ts.Content)
        .IsRequired()
        .HasMaxLength(255);

      builder.Property(ts => ts.TeachingWeekId)
        .IsRequired();

      builder.Property(ts => ts.SubjectId)
        .IsRequired();

      builder.HasOne(ts => ts.TeachingWeek)
        .WithMany(ts => ts.TeachingSessions)
        .HasForeignKey(ts => ts.TeachingWeekId)
        .OnDelete(DeleteBehavior.Restrict);

      builder.HasOne(ts => ts.Subject)
        .WithMany(ts => ts.TeachingSessions)
        .HasForeignKey(ts => ts.SubjectId)
        .OnDelete(DeleteBehavior.Cascade);
    }
  }
}