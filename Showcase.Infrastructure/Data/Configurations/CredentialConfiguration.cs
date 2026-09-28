using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Showcase.Domain.Entities;
using Showcase.Domain.ValueObjects;

namespace Showcase.Infrastructure.Data.Configurations;

public class CredentialConfiguration : IEntityTypeConfiguration<Credential>
{
    public void Configure(EntityTypeBuilder<Credential> builder)
    {
        builder.HasKey(c => c.Id);

        builder.Property(c => c.ProfileId).IsRequired();
        builder.HasIndex(c => c.ProfileId);

        builder.Property(c => c.Name).IsRequired().HasMaxLength(150);
        builder.Property(c => c.IssuingOrganization).IsRequired().HasMaxLength(150);
        builder.Property(c => c.CredentialId).HasMaxLength(100);

        builder.OwnsOne(c => c.Validity, validityBuilder =>
        {
            validityBuilder.Property(v => v.Start)
                .HasColumnName("ValidityStart")
                .IsRequired();

            validityBuilder.Property(v => v.End)
                .HasColumnName("ValidityEnd");
        });

        builder.OwnsOne(c => c.VerificationUrl, urlBuilder =>
        {
            urlBuilder.Property(u => u.Value)
                .HasColumnName("VerificationUrl")
                .HasMaxLength(Url.MaxLength);
        });

        builder.OwnsOne(c => c.MediaUrl, mediaBuilder =>
        {
            mediaBuilder.Property(m => m.Value)
                .HasColumnName("MediaUrl")
                .HasMaxLength(StorageKey.MaxLength);
        });
    }
}
