namespace Showcase.Infrastructure.Data.Configurations;

public class CountryConfiguration : IEntityTypeConfiguration<Country>
{
    public void Configure(EntityTypeBuilder<Country> builder)
    {
        builder.HasKey(c => c.Id);
        builder.Property(c => c.Id)
            .ValueGeneratedNever();

        builder.Property(c => c.Alpha2)
            .IsRequired()
            .HasMaxLength(2);

        builder.Property(c => c.Alpha3)
            .IsRequired()
            .HasMaxLength(3);

        builder.Property(c => c.Name)
            .IsRequired()
            .HasMaxLength(100);

        builder.HasIndex(c => c.Alpha2)
            .IsUnique();

        builder.HasIndex(c => c.Alpha3)
            .IsUnique();

        builder.HasIndex(c => c.Name);
    }
}
