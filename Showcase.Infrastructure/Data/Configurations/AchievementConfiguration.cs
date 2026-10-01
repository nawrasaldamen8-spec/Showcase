using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Showcase.Domain.Entities;
using Showcase.Domain.ValueObjects;

namespace Showcase.Infrastructure.Data.Configurations;

public class AchievementConfiguration : IEntityTypeConfiguration<Achievement>
{
    public void Configure(EntityTypeBuilder<Achievement> builder)
    {
        builder.HasKey(a => a.Id);

        builder.Property(a => a.ProfileId).IsRequired();
        builder.HasIndex(a => a.ProfileId);

        builder.Property(a => a.Title).IsRequired().HasMaxLength(200);
        builder.Property(a => a.Type).HasMaxLength(100);
        builder.Property(a => a.Organization).HasMaxLength(150);
        builder.Property(a => a.Date).HasMaxLength(50);
        builder.Property(a => a.Description).HasMaxLength(2000);
        builder.Ignore(a => a.CreatedAtUtc);

        builder.OwnsOne(a => a.Url, urlBuilder =>
        {
            urlBuilder.Property(u => u.Value)
                .HasColumnName("Url")
                .HasMaxLength(Url.MaxLength);
        });

        builder.OwnsOne(a => a.MediaUrl, mediaBuilder =>
        {
            mediaBuilder.Property(m => m.Value)
                .HasColumnName("MediaUrl")
                .HasMaxLength(StorageKey.MaxLength);
        });
    }
}
