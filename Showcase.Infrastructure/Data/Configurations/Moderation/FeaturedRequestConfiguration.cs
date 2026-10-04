using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Showcase.Domain.Entities;

namespace Showcase.Infrastructure.Data.Configurations;

public class FeaturedRequestConfiguration : IEntityTypeConfiguration<FeaturedRequest>
{
    public void Configure(EntityTypeBuilder<FeaturedRequest> builder)
    {
        builder.HasKey(r => r.Id);

        builder.Property(r => r.UserId)
            .IsRequired()
            .HasMaxLength(450);

        builder.Property(r => r.Message)
            .IsRequired()
            .HasMaxLength(2000);

        builder.Property(r => r.Status)
            .IsRequired()
            .HasConversion<int>();

        builder.Property(r => r.AdminNotes)
            .HasMaxLength(2000);

        builder.Property(r => r.CreatedAtUtc)
            .IsRequired();

        builder.Property(r => r.ReviewedAtUtc);

        builder.HasIndex(r => new { r.UserId, r.Status });
        builder.HasIndex(r => r.Status);
    }
}
