namespace Showcase.Infrastructure.Data.Configurations;

public class ContentReportConfiguration : IEntityTypeConfiguration<ContentReport>
{
    public void Configure(EntityTypeBuilder<ContentReport> builder)
    {
        builder.ToTable("ContentReports");

        builder.HasKey(r => r.Id);

        builder.Property(r => r.ReporterUserId)
            .IsRequired()
            .HasMaxLength(450);

        builder.Property(r => r.TargetType)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(r => r.TargetId)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(r => r.TargetLabel)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(r => r.Reason)
            .IsRequired()
            .HasMaxLength(1000);

        builder.Property(r => r.ActionTaken)
            .HasMaxLength(500);

        builder.Property(r => r.Status)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(r => r.CreatedAtUtc)
            .IsRequired();

        builder.HasIndex(r => r.Status);
        builder.HasIndex(r => r.ReporterUserId);
    }
}
