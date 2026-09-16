using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Showcase.Domain.Entities.ContactMessage;

namespace Showcase.Infrastructure.Data.Configurations;

public class ContactMessageConfiguration : IEntityTypeConfiguration<ContactMessage>
{
    public void Configure(EntityTypeBuilder<ContactMessage> builder)
    {
        builder.HasKey(c => c.Id);

        builder.Property(c => c.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(c => c.Subject)
            .HasMaxLength(200);

        builder.Property(c => c.Message)
            .IsRequired()
            .HasMaxLength(4000);

        builder.OwnsOne(c => c.EmailAddress, emailBuilder =>
        {
            emailBuilder.Property(e => e.Value)
                .HasColumnName("EmailAddress")
                .IsRequired()
                .HasMaxLength(200);
        });
    }
}
