namespace Showcase.Infrastructure.Data.Configurations;

public class ProfileVisitConfiguration : IEntityTypeConfiguration<ProfileVisit>
{
    public void Configure(EntityTypeBuilder<ProfileVisit> builder)
    {
        builder.HasKey(pv => pv.Id);

        builder.Property(pv => pv.ProfileId)
            .IsRequired();

        builder.Property(pv => pv.HashedIp)
            .IsRequired()
            .HasMaxLength(128);

        builder.Property(pv => pv.VisitorUserId)
            .HasMaxLength(450);

        builder.Property(pv => pv.VisitorToken)
            .HasMaxLength(128);

        builder.Property(pv => pv.VisitedAtUtc)
            .IsRequired();

        builder.HasIndex(pv => new { pv.ProfileId, pv.HashedIp, pv.VisitedAtUtc });
        builder.HasIndex(pv => new { pv.ProfileId, pv.VisitedAtUtc });

        builder.HasOne<Profile>()
            .WithMany()
            .HasForeignKey(pv => pv.ProfileId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
