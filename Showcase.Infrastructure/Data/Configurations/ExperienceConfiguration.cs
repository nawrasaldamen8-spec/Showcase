using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Showcase.Domain.Entities;
using Showcase.Domain.ValueObjects;

namespace Showcase.Infrastructure.Data.Configurations;

public class ExperienceConfiguration : IEntityTypeConfiguration<Experience>
{
    public void Configure(EntityTypeBuilder<Experience> builder)
    {
        builder.HasKey(e => e.Id);

        builder.Property(e => e.ProfileId).IsRequired();
        builder.HasIndex(e => e.ProfileId);

        builder.Property(e => e.JobTitle).IsRequired().HasMaxLength(150);
        builder.Property(e => e.Company).IsRequired().HasMaxLength(150);
        builder.Property(e => e.Description).HasMaxLength(2000);
        builder.Property(e => e.Achievements).HasMaxLength(2000);
        builder.Property(e => e.EmploymentType).HasMaxLength(50);
        builder.Property(e => e.Location).HasMaxLength(150);

        builder.OwnsOne(e => e.Period, periodBuilder =>
        {
            periodBuilder.Property(p => p.Start)
                .HasColumnName("PeriodStart")
                .IsRequired();

            periodBuilder.Property(p => p.End)
                .HasColumnName("PeriodEnd");
        });

        builder.Property(e => e.SkillsUsed).HasColumnType("text[]");
    }
}
