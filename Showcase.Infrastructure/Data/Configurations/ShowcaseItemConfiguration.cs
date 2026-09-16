using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Showcase.Domain.Entities.ShowcaseItem;

namespace Showcase.Infrastructure.Data.Configurations;

public class ShowcaseItemConfiguration : IEntityTypeConfiguration<ShowcaseItem>
{
    public void Configure(EntityTypeBuilder<ShowcaseItem> builder)
    {
        builder.HasKey(s => s.Id);

        builder.Property(s => s.Title)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(s => s.Description)
            .HasMaxLength(2000);

        builder.OwnsOne(s => s.ImageUrl, urlBuilder =>
        {
            urlBuilder.Property(u => u.Value)
                .HasColumnName("ImageUrl")
                .HasMaxLength(1000);
        });

        builder.OwnsOne(s => s.LinkUrl, urlBuilder =>
        {
            urlBuilder.Property(u => u.Value)
                .HasColumnName("LinkUrl")
                .HasMaxLength(1000);
        });
    }
}
