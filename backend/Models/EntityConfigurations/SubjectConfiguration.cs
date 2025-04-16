using backend.Models.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend.Models.EntityConfigurations
{
  public class SubjectConfiguration : IEntityTypeConfiguration<Subject>
  {
    public void Configure(EntityTypeBuilder<Subject> builder)
    {
      builder.ToTable("Subjects");

      builder.HasKey(s => s.id);

      builder.Property(s => s.ClassCode)
        .IsRequired()
        .HasMaxLength(20);

      builder.Property(s => s.ClassName)
        .IsRequired()
        .HasMaxLength(255);

      builder.Property(s => s.SubjectName)
        .IsRequired()
        .HasMaxLength(255);

      builder.Property(ts => ts.Room)
        .IsRequired()
        .HasMaxLength(255);

      builder.Property(s => s.MaxStudent)
        .IsRequired();

      builder.Property(s => s.TeacherCode)
        .IsRequired()
        .HasMaxLength(20);

      builder.HasOne(s => s.Teacher)
        .WithMany(s => s.Subjects)
        .HasForeignKey(s => s.TeacherCode)
        .OnDelete(DeleteBehavior.Cascade);
    }
  }
}