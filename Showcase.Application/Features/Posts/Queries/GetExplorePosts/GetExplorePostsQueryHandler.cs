using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Showcase.Application.Common.Interfaces;
using Showcase.Application.Features.Posts.Common;
using Showcase.Domain.Common.Results;
using Showcase.Domain.Entities;
using Showcase.Domain.Enums;

namespace Showcase.Application.Features.Posts.Queries.GetExplorePosts;

public class GetExplorePostsQueryHandler : IRequestHandler<GetExplorePostsQuery, Result<PaginatedList<PostSummaryResponse>>>
{
    private readonly IApplicationDbContext _context;
    private readonly IIdentityService _identityService;
    private readonly IStorageService _storageService;

    public GetExplorePostsQueryHandler(
        IApplicationDbContext context,
        IIdentityService identityService,
        IStorageService storageService)
    {
        _context = context;
        _identityService = identityService;
        _storageService = storageService;
    }

    public async Task<Result<PaginatedList<PostSummaryResponse>>> Handle(GetExplorePostsQuery request, CancellationToken ct)
    {
        var query = _context.Posts
            .Include(p => p.Images)
            .Where(p => p.Status == PostStatus.Published);

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.Trim().ToLower();
            query = query.Where(p => p.Title.ToLower().Contains(search) || p.Description.ToLower().Contains(search));
        }

        var totalCount = await query.CountAsync(ct);

        var posts = await query
            .OrderByDescending(p => p.PublishedAt)
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(ct);

        // Batch load profiles for creators
        var profileIds = posts.Select(p => p.ProfileId).Distinct().ToList();
        var profiles = await _context.Profiles
            .Where(p => profileIds.Contains(p.Id))
            .ToDictionaryAsync(p => p.Id, p => p, ct);

        // Cache creator DTOs
        var creatorCache = new Dictionary<Guid, PostCreatorDto>();
        foreach (var profile in profiles.Values)
        {
            var userResult = await _identityService.GetUserByIdAsync(profile.UserId, ct);
            if (userResult.IsSuccess)
            {
                var avatarUrl = profile.AvatarKey is not null
                    ? _storageService.GetPublicUrl(profile.AvatarKey.Value)
                    : null;

                creatorCache[profile.Id] = new PostCreatorDto(
                    profile.Id,
                    userResult.Value.UserName,
                    profile.FirstName,
                    profile.LastName,
                    avatarUrl);
            }
        }

        var items = posts.Select(post =>
        {
            var firstImage = post.Images.OrderBy(i => i.DisplayOrder).FirstOrDefault();
            var thumbnailUrl = firstImage is not null
                ? _storageService.GetPublicUrl(firstImage.StorageKey.Value)
                : null;

            creatorCache.TryGetValue(post.ProfileId, out var creator);

            return new PostSummaryResponse(
                post.Id,
                post.ProfileId,
                post.Title,
                post.Description,
                post.ExternalUrl?.Value,
                post.Status.ToString(),
                post.CreatedAt,
                post.PublishedAt,
                thumbnailUrl,
                post.Images.Count,
                creator);
        }).ToList();

        return PaginatedList<PostSummaryResponse>.Create(items, request.PageNumber, request.PageSize, totalCount);
    }
}
