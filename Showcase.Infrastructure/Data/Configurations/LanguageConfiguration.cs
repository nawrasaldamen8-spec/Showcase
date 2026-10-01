using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Showcase.Domain.Entities;
using Showcase.Domain.Enums;

namespace Showcase.Infrastructure.Data.Configurations;

public class LanguageConfiguration : IEntityTypeConfiguration<Language>
{
    public void Configure(EntityTypeBuilder<Language> builder)
    {
        builder.HasKey(l => l.Id);

        builder.Property(l => l.ProfileId).IsRequired();
        builder.HasIndex(l => l.ProfileId);

        builder.Property(l => l.LanguageName).IsRequired().HasMaxLength(100);
        builder.Property(l => l.Proficiency).HasConversion<int>().IsRequired();
        builder.Ignore(l => l.CreatedAtUtc);
    }
}
