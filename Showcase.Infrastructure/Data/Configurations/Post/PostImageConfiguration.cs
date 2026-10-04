using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Showcase.Domain.Entities;
using Showcase.Domain.ValueObjects;

namespace Showcase.Infrastructure.Data.Configurations;

public class PostImageConfiguration : IEntityTypeConfiguration<PostImage>
{
    public void Configure(EntityTypeBuilder<PostImage> builder)
    {
        builder.HasKey(i => i.Id);

        builder.Property(i => i.PostId)
            .IsRequired();

        builder.OwnsOne(i => i.StorageKey, keyBuilder =>
        {
            keyBuilder.Property(k => k.Value)
                .HasColumnName("StorageKey")
                .IsRequired()
                .HasMaxLength(StorageKey.MaxLength);
        });

        builder.Property(i => i.DisplayOrder)
            .IsRequired()
            .HasDefaultValue(0);

        builder.Property(i => i.CreatedAt)
            .IsRequired();

        builder.HasIndex(i => i.PostId);
    }
}
