using Showcase.Infrastructure.Identity;

namespace Showcase.Infrastructure.Data.Configurations;

public class ApplicationUserConfiguration : IEntityTypeConfiguration<ApplicationUser>
{
    public void Configure(EntityTypeBuilder<ApplicationUser> builder)
    {
        builder.Property(u => u.RefreshToken)
            .HasMaxLength(500);

        builder.Property(u => u.IsBanned).IsRequired().HasDefaultValue(false);
        builder.Property(u => u.BanReason).HasMaxLength(500);
        builder.Property(u => u.BannedAtUtc);
        builder.Property(u => u.IsDeleted).IsRequired().HasDefaultValue(false);
        builder.Property(u => u.DeletedAtUtc);

        builder.HasIndex(u => u.IsBanned);

        builder.HasOne(u => u.Profile)
            .WithOne()
            .HasForeignKey<Profile>(p => p.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
