using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Showcase.Domain.Entities;
using Showcase.Domain.ValueObjects;

namespace Showcase.Infrastructure.Data.Configurations;

public class PostConfiguration : IEntityTypeConfiguration<Post>
{
    public void Configure(EntityTypeBuilder<Post> builder)
    {
        builder.HasKey(p => p.Id);

        builder.Property(p => p.ProfileId)
            .IsRequired();

        builder.Property(p => p.Title)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(p => p.Description)
            .HasMaxLength(4000);

        builder.OwnsOne(p => p.ExternalUrl, urlBuilder =>
        {
            urlBuilder.Property(u => u.Value)
                .HasColumnName("ExternalUrl")
                .HasMaxLength(Url.MaxLength);
        });

        builder.Property(p => p.Status)
            .IsRequired()
            .HasConversion<int>();

        builder.Property(p => p.CreatedAt)
            .IsRequired();

        builder.Property(p => p.PublishedAt);

        builder.Property(p => p.UpdatedAt);

        builder.HasIndex(p => p.ProfileId);
        builder.HasIndex(p => p.Status);
        builder.HasIndex(p => p.PublishedAt);

        builder.HasOne<Profile>()
            .WithMany()
            .HasForeignKey(p => p.ProfileId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(p => p.Images)
            .WithOne()
            .HasForeignKey(i => i.PostId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Navigation(p => p.Images)
            .UsePropertyAccessMode(PropertyAccessMode.Field);
    }
}
