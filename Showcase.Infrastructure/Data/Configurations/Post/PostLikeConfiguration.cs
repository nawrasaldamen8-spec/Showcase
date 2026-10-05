namespace Showcase.Infrastructure.Data.Configurations;

public class PostLikeConfiguration : IEntityTypeConfiguration<PostLike>
{
    public void Configure(EntityTypeBuilder<PostLike> builder)
    {
        builder.HasKey(pl => pl.Id);

        builder.Property(pl => pl.PostId)
            .IsRequired();

        builder.Property(pl => pl.UserId)
            .IsRequired()
            .HasMaxLength(450);

        builder.Property(pl => pl.CreatedAtUtc)
            .IsRequired();

        builder.HasIndex(pl => new { pl.PostId, pl.UserId })
            .IsUnique();

        builder.HasOne<Post>()
            .WithMany()
            .HasForeignKey(pl => pl.PostId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
