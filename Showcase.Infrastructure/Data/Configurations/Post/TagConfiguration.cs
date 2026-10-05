namespace Showcase.Infrastructure.Data.Configurations;

public class TagConfiguration : IEntityTypeConfiguration<Tag>
{
    public void Configure(EntityTypeBuilder<Tag> builder)
    {
        builder.HasKey(t => t.Id);

        builder.Property(t => t.Name)
            .IsRequired()
            .HasMaxLength(Tag.MaxNameLength);

        builder.Property(t => t.NormalizedName)
            .IsRequired()
            .HasMaxLength(Tag.MaxNameLength);

        builder.HasIndex(t => t.NormalizedName)
            .IsUnique();

        builder.Property(t => t.CreatedAt)
            .IsRequired();
    }
}
