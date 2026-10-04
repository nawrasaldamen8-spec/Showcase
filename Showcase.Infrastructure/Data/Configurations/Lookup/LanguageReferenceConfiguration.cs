using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Showcase.Domain.Entities;

namespace Showcase.Infrastructure.Data.Configurations;

public class LanguageReferenceConfiguration : IEntityTypeConfiguration<LanguageReference>
{
    public void Configure(EntityTypeBuilder<LanguageReference> builder)
    {
        builder.HasKey(l => l.Code);
        builder.Property(l => l.Code)
            .HasMaxLength(10);

        builder.Property(l => l.Name)
            .IsRequired()
            .HasMaxLength(150);

        builder.HasIndex(l => l.Name);
    }
}
