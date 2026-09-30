using Microsoft.EntityFrameworkCore;
using Showcase.Domain.Entities;

namespace Showcase.Application.Common.Interfaces;

public interface IApplicationDbContext
{
    DbSet<Profile> Profiles { get; }
    DbSet<SocialLink> SocialLinks { get; }
    DbSet<Post> Posts { get; }
    DbSet<PostImage> PostImages { get; }
    DbSet<Tag> Tags { get; }
    DbSet<PostTag> PostTags { get; }
    DbSet<PostLike> PostLikes { get; }
    DbSet<ProfileVisit> ProfileVisits { get; }
    DbSet<Notification> Notifications { get; }
    DbSet<VerificationRequest> VerificationRequests { get; }
    DbSet<FeaturedRequest> FeaturedRequests { get; }
    DbSet<Experience> Experiences { get; }
    DbSet<Academic> Academics { get; }
    DbSet<Skill> Skills { get; }
    DbSet<Credential> Credentials { get; }
    DbSet<Language> Languages { get; }
    DbSet<Achievement> Achievements { get; }
    DbSet<CareerVisibility> CareerVisibilities { get; }
    DbSet<Country> Countries { get; }
    DbSet<LanguageReference> LanguageReferences { get; }
    DbSet<ContentReport> ContentReports { get; }

    DbSet<TEntity> Set<TEntity>() where TEntity : class;

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
