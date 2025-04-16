using backend.Models.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend.Models.EntityConfigurations
{
  public class UserConfiguration : IEntityTypeConfiguration<User>
  {
    public void Configure(EntityTypeBuilder<User> builder)
    {
      builder.ToTable("Users");

      builder.HasKey(u => u.id);

      builder.Property(u => u.Username)
        .IsRequired()
        .HasMaxLength(255);

      builder.Property(u => u.Password)
        .IsRequired()
        .HasMaxLength(255);

      builder.Property(u => u.Role)
        .IsRequired()
        .HasMaxLength(255);

      builder.Property(u => u.Code)
        .IsRequired()
        .HasMaxLength(255);

      builder.Property(u => u.CreatedAt)
        .HasDefaultValueSql("GETUTCDATE()");
    }
  }
}