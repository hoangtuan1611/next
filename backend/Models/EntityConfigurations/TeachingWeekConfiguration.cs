using backend.Models.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend.Models.EntityConfigurations
{
  public class TeachingWeekConfiguration : IEntityTypeConfiguration<TeachingWeek>
  {
    public void Configure(EntityTypeBuilder<TeachingWeek> builder)
    {
      builder.ToTable("TeachingWeeks");

      builder.HasKey(tw => tw.id);

      builder.Property(tw => tw.WeekNumber)
        .IsRequired();

      builder.Property(tw => tw.StartDate)
        .IsRequired();

      builder.Property(tw => tw.EndDate)
        .IsRequired();

      builder.Property(tw => tw.TeacherCode)
        .IsRequired()
        .HasMaxLength(20);

      builder.HasOne(tw => tw.Teacher)
        .WithMany(tw => tw.TeachingWeeks)
        .HasForeignKey(tw => tw.TeacherCode)
        .OnDelete(DeleteBehavior.Cascade);
    }
  }
}