using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Showcase.Domain.Entities;

namespace Showcase.Infrastructure.Data.Configurations;

public class AcademicConfiguration : IEntityTypeConfiguration<Academic>
{
    public void Configure(EntityTypeBuilder<Academic> builder)
    {
        builder.HasKey(a => a.Id);

        builder.Property(a => a.ProfileId).IsRequired();
        builder.HasIndex(a => a.ProfileId);

        builder.Property(a => a.Institution).IsRequired().HasMaxLength(150);
        builder.Property(a => a.Degree).IsRequired().HasMaxLength(150);
        builder.Property(a => a.FieldOfStudy).IsRequired().HasMaxLength(150);
        builder.Property(a => a.Gpa).HasMaxLength(50);
        builder.Property(a => a.Achievements).HasMaxLength(2000);
        builder.Property(a => a.Location).HasMaxLength(150);
        builder.Property(a => a.Description).HasMaxLength(2000);

        builder.OwnsOne(a => a.Period, periodBuilder =>
        {
            periodBuilder.Property(p => p.Start)
                .HasColumnName("PeriodStart")
                .IsRequired();

            periodBuilder.Property(p => p.End)
                .HasColumnName("PeriodEnd");
        });
    }
}
