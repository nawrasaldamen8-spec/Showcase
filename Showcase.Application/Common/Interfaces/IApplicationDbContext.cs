using Microsoft.EntityFrameworkCore;
using Showcase.Domain.Entities;

namespace Showcase.Application.Common.Interfaces;

public interface IApplicationDbContext
{
    DbSet<Profile> Profiles { get; }
    DbSet<SocialLink> SocialLinks { get; }
    DbSet<Post> Posts { get; }
    DbSet<PostImage> PostImages { get; }

    DbSet<TEntity> Set<TEntity>() where TEntity : class;

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
