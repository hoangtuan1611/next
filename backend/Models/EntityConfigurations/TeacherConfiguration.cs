using backend.Models.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend.Models.EntityConfigurations
{
  public class TeacherConfiguration : IEntityTypeConfiguration<Teacher>
  {
    public void Configure(EntityTypeBuilder<Teacher> builder)
    {
      builder.ToTable("Teachers");

      builder.HasKey(t => t.TeacherCode);

      builder.Property(t => t.TeacherCode)
        .HasMaxLength(20)
        .IsRequired();

      builder.Property(t => t.TeacherName)
        .IsRequired()
        .HasMaxLength(255);
    }
  }
}