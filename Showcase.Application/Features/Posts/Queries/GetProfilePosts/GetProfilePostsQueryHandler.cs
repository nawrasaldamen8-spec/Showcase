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

namespace Showcase.Application.Features.Posts.Queries.GetProfilePosts;

public class GetProfilePostsQueryHandler : IRequestHandler<GetProfilePostsQuery, Result<PaginatedList<PostSummaryResponse>>>
{
    private readonly IApplicationDbContext _context;
    private readonly IIdentityService _identityService;
    private readonly IStorageService _storageService;
    private readonly ICurrentUserService _currentUserService;

    public GetProfilePostsQueryHandler(
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

    public async Task<Result<PaginatedList<PostSummaryResponse>>> Handle(GetProfilePostsQuery request, CancellationToken ct)
    {
        var userResult = await _identityService.GetUserByUsernameAsync(request.Username, ct);
        if (userResult.IsFailure)
        {
            return Result.Failure<PaginatedList<PostSummaryResponse>>(userResult.Error);
        }

        var user = userResult.Value;

        // Public route: a banned or soft-deleted account must appear as missing rather than as empty.
        var profile = await _context.Profiles
            .FirstOrDefaultAsync(p => p.UserId == user.Id && !p.IsBanned && !p.IsDeleted, ct);

        if (profile is null)
        {
            return ProfileErrors.NotFoundForUser(user.Id);
        }

        var query = _context.Posts
            .Include(p => p.Images)
            .Include(p => p.PostTags)
                .ThenInclude(pt => pt.Tag)
            .Where(p => p.ProfileId == profile.Id && p.Status == PostStatus.Published);

        var totalCount = await query.CountAsync(ct);

        var posts = await query
            .OrderByDescending(p => p.PublishedAt)
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(ct);

        var avatarUrl = profile.AvatarKey is not null
            ? _storageService.GetPublicUrl(profile.AvatarKey.Value)
            : null;

        var creator = new PostCreatorDto(
            profile.Id,
            user.UserName,
            profile.Name,
            avatarUrl);

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
