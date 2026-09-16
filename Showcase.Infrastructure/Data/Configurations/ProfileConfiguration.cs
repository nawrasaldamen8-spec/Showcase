using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Showcase.Domain.Entities.Profile;

namespace Showcase.Infrastructure.Data.Configurations;

public class ProfileConfiguration : IEntityTypeConfiguration<Profile>
{
    public void Configure(EntityTypeBuilder<Profile> builder)
    {
        builder.HasKey(p => p.Id);

        builder.Property(p => p.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(p => p.Title)
            .HasMaxLength(200);

        builder.Property(p => p.Bio)
            .HasMaxLength(2000);

        builder.Property(p => p.Location)
            .HasMaxLength(200);

        builder.OwnsOne(p => p.ProfileImageUrl, urlBuilder =>
        {
            urlBuilder.Property(u => u.Value)
                .HasColumnName("ProfileImageUrl")
                .HasMaxLength(1000);
        });

        // Seeding a default profile
        builder.HasData(new
        {
            Id = System.Guid.Parse("11111111-1111-1111-1111-111111111111"),
            Name = "John Doe",
            Title = "Software Developer",
            Bio = "Welcome to my portfolio",
            Location = "Amman, Jordan"
        });
    }
}
