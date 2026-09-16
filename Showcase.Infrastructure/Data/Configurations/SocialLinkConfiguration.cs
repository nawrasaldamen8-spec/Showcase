using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Showcase.Domain.Entities.SocialLink;

namespace Showcase.Infrastructure.Data.Configurations;

public class SocialLinkConfiguration : IEntityTypeConfiguration<SocialLink>
{
    public void Configure(EntityTypeBuilder<SocialLink> builder)
    {
        builder.HasKey(s => s.Id);

        builder.Property(s => s.Platform)
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.OwnsOne(s => s.LinkUrl, urlBuilder =>
        {
            urlBuilder.Property(u => u.Value)
                .HasColumnName("LinkUrl")
                .IsRequired()
                .HasMaxLength(1000);
        });
    }
}
