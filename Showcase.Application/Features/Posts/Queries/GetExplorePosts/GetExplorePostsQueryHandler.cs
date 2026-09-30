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
    private readonly ICurrentUserService _currentUserService;

    public GetExplorePostsQueryHandler(
        IApplicationDbContext context,
        IIdentityService identityService,
        IStorageService storageService,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _identityService = identityService;
        _storageService = storageService;
        _currentUserService = currentUserService;
    }

    public async Task<Result<PaginatedList<PostSummaryResponse>>> Handle(GetExplorePostsQuery request, CancellationToken ct)
    {
        // Post exposes only ProfileId (no navigation), so visible creators are resolved as a subquery. This keeps
        // the ban and soft-delete filter inside SQL, which a post-filter over loaded profiles would break for paging.
        var visibleProfileIds = _context.Profiles
            .Where(profile => !profile.IsBanned && !profile.IsDeleted)
            .Select(profile => profile.Id);

        var query = _context.Posts
            .Include(p => p.Images)
            .Include(p => p.PostTags)
                .ThenInclude(pt => pt.Tag)
            .Where(p => p.Status == PostStatus.Published && visibleProfileIds.Contains(p.ProfileId));

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

        // Batch load users for creators
        var userIds = profiles.Values.Select(p => p.UserId).Distinct().ToList();
        var usersResult = await _identityService.GetUsersByIdsAsync(userIds, ct);
        var usersDict = usersResult?.IsSuccess == true ? usersResult.Value : new Dictionary<string, UserIdentityDetails>();

        // Cache creator DTOs
        var creatorCache = new Dictionary<Guid, PostCreatorDto>();
        foreach (var profile in profiles.Values)
        {
            if (!usersDict.TryGetValue(profile.UserId, out var userDetails))
            {
                var individualUser = await _identityService.GetUserByIdAsync(profile.UserId, ct);
                if (individualUser?.IsSuccess == true)
                {
                    userDetails = individualUser.Value;
                }
            }

            if (userDetails is not null)
            {
                var avatarUrl = profile.AvatarKey is not null
                    ? _storageService.GetPublicUrl(profile.AvatarKey.Value)
                    : null;

                creatorCache[profile.Id] = new PostCreatorDto(
                    profile.Id,
                    userDetails.UserName,
                    profile.Name,
                    avatarUrl);
            }
        }

        var currentUserId = _currentUserService.UserId;
        var postIds = posts.Select(p => p.Id).ToList();
        var likedPostIds = new HashSet<Guid>();
        if (!string.IsNullOrWhiteSpace(currentUserId) && postIds.Count > 0)
        {
            var likes = await _context.PostLikes
                .Where(l => postIds.Contains(l.PostId) && l.UserId == currentUserId)
                .Select(l => l.PostId)
                .ToListAsync(ct);
            likedPostIds = new HashSet<Guid>(likes);
        }

        var items = posts.Select(post =>
        {
            var firstImage = post.Images.OrderBy(i => i.DisplayOrder).FirstOrDefault();
            var thumbnailUrl = firstImage is not null
                ? _storageService.GetPublicUrl(firstImage.StorageKey.Value)
                : null;

            creatorCache.TryGetValue(post.ProfileId, out var creator);

            var tags = post.PostTags
                .Where(pt => pt.Tag != null)
                .Select(pt => pt.Tag.Name)
                .ToList();

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
                tags,
                creator,
                post.LikesCount,
                likedPostIds.Contains(post.Id));
        }).ToList();

        return PaginatedList<PostSummaryResponse>.Create(items, request.PageNumber, request.PageSize, totalCount);
    }
}
