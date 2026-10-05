namespace Showcase.Infrastructure.Data.Configurations;

public class SpecialtyReferenceConfiguration : IEntityTypeConfiguration<SpecialtyReference>
{
    public void Configure(EntityTypeBuilder<SpecialtyReference> builder)
    {
        builder.HasKey(s => s.Id);
        builder.Property(s => s.Id)
            .ValueGeneratedNever();

        builder.Property(s => s.Code)
            .HasMaxLength(20);

        builder.Property(s => s.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(s => s.Category)
            .IsRequired()
            .HasMaxLength(150);

        builder.Property(s => s.SubField)
            .HasMaxLength(150);

        builder.HasIndex(s => s.Category);
        builder.HasIndex(s => s.Name);
    }
}
