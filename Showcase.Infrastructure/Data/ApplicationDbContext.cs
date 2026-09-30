using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Showcase.Application.Common.Interfaces;
using Showcase.Domain.Entities;
using Showcase.Infrastructure.Identity;

namespace Showcase.Infrastructure.Data;

public class ApplicationDbContext : IdentityDbContext<ApplicationUser>, IApplicationDbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<Profile> Profiles => Set<Profile>();
    public DbSet<SocialLink> SocialLinks => Set<SocialLink>();
    public DbSet<Post> Posts => Set<Post>();
    public DbSet<PostImage> PostImages => Set<PostImage>();
    public DbSet<Tag> Tags => Set<Tag>();
    public DbSet<PostTag> PostTags => Set<PostTag>();
    public DbSet<PostLike> PostLikes => Set<PostLike>();
    public DbSet<ProfileVisit> ProfileVisits => Set<ProfileVisit>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<VerificationRequest> VerificationRequests => Set<VerificationRequest>();
    public DbSet<FeaturedRequest> FeaturedRequests => Set<FeaturedRequest>();
    public DbSet<Experience> Experiences => Set<Experience>();
    public DbSet<Academic> Academics => Set<Academic>();
    public DbSet<Skill> Skills => Set<Skill>();
    public DbSet<Credential> Credentials => Set<Credential>();
    public DbSet<Language> Languages => Set<Language>();
    public DbSet<Achievement> Achievements => Set<Achievement>();
    public DbSet<CareerVisibility> CareerVisibilities => Set<CareerVisibility>();
    public DbSet<Country> Countries => Set<Country>();
    public DbSet<LanguageReference> LanguageReferences => Set<LanguageReference>();
    public DbSet<ContentReport> ContentReports => Set<ContentReport>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);

        modelBuilder.Entity<Profile>().HasQueryFilter(p => !p.IsDeleted && !p.IsBanned);
    }
}
