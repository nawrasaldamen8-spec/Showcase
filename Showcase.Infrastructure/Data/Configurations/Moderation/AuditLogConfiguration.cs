using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Showcase.Domain.Entities;

namespace Showcase.Infrastructure.Data.Configurations;

public class AuditLogConfiguration : IEntityTypeConfiguration<AuditLog>
{
    public void Configure(EntityTypeBuilder<AuditLog> builder)
    {
        builder.ToTable("AuditLogs");

        builder.HasKey(a => a.Id);

        builder.Property(a => a.AdminUserId)
            .IsRequired()
            .HasMaxLength(128);

        builder.Property(a => a.AdminUsername)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(a => a.Action)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(a => a.TargetEntity)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(a => a.TargetId)
            .IsRequired()
            .HasMaxLength(128);

        builder.Property(a => a.TargetLabel)
            .IsRequired()
            .HasMaxLength(250);

        builder.Property(a => a.Reason)
            .HasMaxLength(1000);

        builder.Property(a => a.MetadataJson)
            .HasMaxLength(4000);

        builder.Property(a => a.CreatedAt)
            .IsRequired();

        builder.HasIndex(a => a.CreatedAt);
        builder.HasIndex(a => a.AdminUsername);
        builder.HasIndex(a => a.Action);
    }
}
