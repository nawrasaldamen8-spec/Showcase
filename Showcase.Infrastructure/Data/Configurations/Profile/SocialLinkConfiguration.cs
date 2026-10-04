using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Showcase.Domain.Entities;
using Showcase.Domain.ValueObjects;

namespace Showcase.Infrastructure.Data.Configurations;

public class SocialLinkConfiguration : IEntityTypeConfiguration<SocialLink>
{
    public void Configure(EntityTypeBuilder<SocialLink> builder)
    {
        builder.HasKey(s => s.Id);

        builder.Property(s => s.ProfileId)
            .IsRequired();

        builder.Property(s => s.Platform)
            .IsRequired()
            .HasMaxLength(100);

        builder.OwnsOne(s => s.Url, urlBuilder =>
        {
            urlBuilder.Property(u => u.Value)
                .HasColumnName("Url")
                .IsRequired()
                .HasMaxLength(Url.MaxLength);
        });

        builder.Property(s => s.DisplayOrder)
            .IsRequired()
            .HasDefaultValue(0);

        builder.HasIndex(s => s.ProfileId);
    }
}
