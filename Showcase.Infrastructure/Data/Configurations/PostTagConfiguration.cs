using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Showcase.Domain.Entities;

namespace Showcase.Infrastructure.Data.Configurations;

public class PostTagConfiguration : IEntityTypeConfiguration<PostTag>
{
    public void Configure(EntityTypeBuilder<PostTag> builder)
    {
        builder.HasKey(pt => pt.Id);

        builder.Property(pt => pt.PostId)
            .IsRequired();

        builder.Property(pt => pt.TagId)
            .IsRequired();

        builder.Property(pt => pt.CreatedAt)
            .IsRequired();

        builder.HasIndex(pt => new { pt.PostId, pt.TagId })
            .IsUnique();

        builder.HasOne<Post>()
            .WithMany(p => p.PostTags)
            .HasForeignKey(pt => pt.PostId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(pt => pt.Tag)
            .WithMany()
            .HasForeignKey(pt => pt.TagId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
