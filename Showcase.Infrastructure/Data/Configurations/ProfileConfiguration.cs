using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Showcase.Domain.Entities;
using Showcase.Domain.ValueObjects;

namespace Showcase.Infrastructure.Data.Configurations;

public class ProfileConfiguration : IEntityTypeConfiguration<Profile>
{
    public void Configure(EntityTypeBuilder<Profile> builder)
    {
        builder.HasKey(p => p.Id);

        builder.Property(p => p.UserId)
            .IsRequired()
            .HasMaxLength(450);

        builder.HasIndex(p => p.UserId)
            .IsUnique();

        builder.Property(p => p.FirstName)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(p => p.LastName)
            .IsRequired()
            .HasMaxLength(100);

        builder.OwnsOne(p => p.Bio, bioBuilder =>
        {
            bioBuilder.Property(b => b.Value)
                .HasColumnName("Bio")
                .HasMaxLength(Bio.MaxLength);
        });

        builder.OwnsOne(p => p.AvatarKey, avatarBuilder =>
        {
            avatarBuilder.Property(a => a.Value)
                .HasColumnName("AvatarKey")
                .HasMaxLength(StorageKey.MaxLength);
        });

        builder.Property(p => p.CreatedAt)
            .IsRequired();

        builder.Property(p => p.UpdatedAt);

        builder.HasMany(p => p.SocialLinks)
            .WithOne()
            .HasForeignKey(s => s.ProfileId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Navigation(p => p.SocialLinks)
            .UsePropertyAccessMode(PropertyAccessMode.Field);
    }
}
