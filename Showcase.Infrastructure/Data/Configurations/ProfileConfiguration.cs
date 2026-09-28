using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Showcase.Domain.Entities;
using Showcase.Domain.Enums;
using Showcase.Domain.ValueObjects;

namespace Showcase.Infrastructure.Data.Configurations;

public class ProfileConfiguration : IEntityTypeConfiguration<Profile>
{
    public void Configure(EntityTypeBuilder<Profile> builder)
    {
        builder.HasKey(p => p.Id);

        builder.Property(p => p.UserId).IsRequired().HasMaxLength(450);
        builder.HasIndex(p => p.UserId).IsUnique();

        builder.Property(p => p.Name).IsRequired().HasMaxLength(150);
        builder.Property(p => p.Specialty).HasMaxLength(100);
        builder.Property(p => p.Country).HasMaxLength(100);

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

        // Verification & discovery
        builder.Property(p => p.IsVerified).IsRequired().HasDefaultValue(false);
        builder.Property(p => p.VerificationStatus).HasConversion<int>().IsRequired();
        builder.Property(p => p.FeaturedStatus).HasConversion<int>().IsRequired();

        // Moderation & lifecycle
        builder.Property(p => p.IsBanned).IsRequired().HasDefaultValue(false);
        builder.Property(p => p.BanReason).HasMaxLength(500);
        builder.Property(p => p.BannedAtUtc);
        builder.Property(p => p.IsDeleted).IsRequired().HasDefaultValue(false);
        builder.Property(p => p.DeletedAtUtc);

        builder.Property(p => p.CreatedAt).IsRequired();
        builder.Property(p => p.UpdatedAt);

        ConfigureChildren(builder);
    }

    /// <summary>
    /// Every child collection is backed by a private readonly List, so each navigation must be bound to its
    /// backing field or EF Core silently fails to populate it on materialization.
    /// </summary>
    private static void ConfigureChildren(EntityTypeBuilder<Profile> builder)
    {
        builder.HasMany(p => p.SocialLinks)
            .WithOne()
            .HasForeignKey(s => s.ProfileId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Navigation(p => p.SocialLinks)
            .UsePropertyAccessMode(PropertyAccessMode.Field);

        builder.HasMany(p => p.Experiences)
            .WithOne()
            .HasForeignKey(e => e.ProfileId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Navigation(p => p.Experiences)
            .UsePropertyAccessMode(PropertyAccessMode.Field);

        builder.HasMany(p => p.Academics)
            .WithOne()
            .HasForeignKey(a => a.ProfileId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Navigation(p => p.Academics)
            .UsePropertyAccessMode(PropertyAccessMode.Field);

        builder.HasMany(p => p.Skills)
            .WithOne()
            .HasForeignKey(s => s.ProfileId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Navigation(p => p.Skills)
            .UsePropertyAccessMode(PropertyAccessMode.Field);

        builder.HasMany(p => p.Credentials)
            .WithOne()
            .HasForeignKey(c => c.ProfileId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Navigation(p => p.Credentials)
            .UsePropertyAccessMode(PropertyAccessMode.Field);

        builder.HasMany(p => p.Languages)
            .WithOne()
            .HasForeignKey(l => l.ProfileId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Navigation(p => p.Languages)
            .UsePropertyAccessMode(PropertyAccessMode.Field);

        builder.HasMany(p => p.Achievements)
            .WithOne()
            .HasForeignKey(a => a.ProfileId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Navigation(p => p.Achievements)
            .UsePropertyAccessMode(PropertyAccessMode.Field);

        builder.HasOne(p => p.CareerVisibility)
            .WithOne()
            .HasForeignKey<CareerVisibility>(c => c.ProfileId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
