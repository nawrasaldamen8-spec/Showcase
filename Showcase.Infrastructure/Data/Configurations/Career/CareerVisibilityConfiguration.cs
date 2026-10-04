using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Showcase.Domain.Entities;

namespace Showcase.Infrastructure.Data.Configurations;

public class CareerVisibilityConfiguration : IEntityTypeConfiguration<CareerVisibility>
{
    public void Configure(EntityTypeBuilder<CareerVisibility> builder)
    {
        builder.HasKey(c => c.Id);

        builder.Property(c => c.ProfileId).IsRequired();
        builder.HasIndex(c => c.ProfileId).IsUnique();

        builder.Property(c => c.Experience).IsRequired().HasDefaultValue(true);
        builder.Property(c => c.Academics).IsRequired().HasDefaultValue(true);
        builder.Property(c => c.Skills).IsRequired().HasDefaultValue(true);
        builder.Property(c => c.Credentials).IsRequired().HasDefaultValue(true);
        builder.Property(c => c.Languages).IsRequired().HasDefaultValue(true);
        builder.Property(c => c.Achievements).IsRequired().HasDefaultValue(true);
    }
}
