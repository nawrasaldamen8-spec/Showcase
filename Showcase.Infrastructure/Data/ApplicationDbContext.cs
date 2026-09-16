using Showcase.Application.Common.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Showcase.Infrastructure.Data;

public class ApplicationDbContext : DbContext, IApplicationDbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<Showcase.Domain.Entities.Profile.Profile> Profiles => Set<Showcase.Domain.Entities.Profile.Profile>();
    public DbSet<Showcase.Domain.Entities.ShowcaseItem.ShowcaseItem> ShowcaseItems => Set<Showcase.Domain.Entities.ShowcaseItem.ShowcaseItem>();
    public DbSet<Showcase.Domain.Entities.SocialLink.SocialLink> SocialLinks => Set<Showcase.Domain.Entities.SocialLink.SocialLink>();
    public DbSet<Showcase.Domain.Entities.ContactMessage.ContactMessage> ContactMessages => Set<Showcase.Domain.Entities.ContactMessage.ContactMessage>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);
    }
}
