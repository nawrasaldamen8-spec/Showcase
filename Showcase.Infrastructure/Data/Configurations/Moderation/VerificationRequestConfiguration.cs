namespace Showcase.Infrastructure.Data.Configurations;

public class VerificationRequestConfiguration : IEntityTypeConfiguration<VerificationRequest>
{
    public void Configure(EntityTypeBuilder<VerificationRequest> builder)
    {
        builder.HasKey(r => r.Id);

        builder.Property(r => r.UserId)
            .IsRequired()
            .HasMaxLength(450);

        builder.Property(r => r.Message)
            .IsRequired()
            .HasMaxLength(2000);

        builder.Property(r => r.Category)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(r => r.IdentificationNumber)
            .HasMaxLength(100);

        builder.Property(r => r.WebsiteUrl)
            .HasMaxLength(500);

        builder.Property(r => r.PortfolioUrl)
            .HasMaxLength(500);

        builder.Property(r => r.DocumentUrl)
            .HasMaxLength(500);

        builder.Property(r => r.Status)
            .IsRequired()
            .HasConversion<int>();

        builder.Property(r => r.AdminNotes)
            .HasMaxLength(2000);

        builder.Property(r => r.CreatedAtUtc)
            .IsRequired();

        builder.Property(r => r.ReviewedAtUtc);

        builder.HasIndex(r => new { r.UserId, r.Status });
        builder.HasIndex(r => r.Status);
    }
}
