using backend.Models.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend.Models.EntityConfigurations
{
  public class SubjectLogConfiguration : IEntityTypeConfiguration<SubjectLog>
  {
    public void Configure(EntityTypeBuilder<SubjectLog> builder)
    {
      builder.ToTable("SubjectLogs");

      builder.HasKey(sl => sl.id);

      builder.Property(sl => sl.CurrentCount)
        .IsRequired();

      builder.Property(sl => sl.CreateDate)
        .IsRequired();

      builder.Property(sl => sl.CreateTime)
        .IsRequired();

      builder.Property(sl => sl.ImgPath)
      .IsRequired()
      .HasMaxLength(255);

      builder.Property(sl => sl.TeachingSessionId)
        .IsRequired();

      builder.HasOne(sl => sl.TeachingSession)
        .WithMany(sl => sl.SubjectLogs)
        .HasForeignKey(sl => sl.TeachingSessionId)
        .OnDelete(DeleteBehavior.Cascade);
    }
  }
}