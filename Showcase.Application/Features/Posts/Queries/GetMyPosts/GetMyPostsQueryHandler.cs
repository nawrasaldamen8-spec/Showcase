using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Showcase.Application.Common.Interfaces;
using Showcase.Application.Features.Posts.Common;
using Showcase.Domain.Common.Results;
using Showcase.Domain.Entities;

namespace Showcase.Application.Features.Posts.Queries.GetMyPosts;

public class GetMyPostsQueryHandler : IRequestHandler<GetMyPostsQuery, Result<PaginatedList<PostSummaryResponse>>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly IIdentityService _identityService;
    private readonly IStorageService _storageService;

    public GetMyPostsQueryHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        IIdentityService identityService,
        IStorageService storageService)
    {
        _context = context;
        _currentUserService = currentUserService;
        _identityService = identityService;
        _storageService = storageService;
    }

    public async Task<Result<PaginatedList<PostSummaryResponse>>> Handle(GetMyPostsQuery request, CancellationToken ct)
    {
        var userId = _currentUserService.UserId;
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Error.Unauthorized("Auth.Unauthorized", "User is not authenticated.");
        }

        var profile = await _context.Profiles.FirstOrDefaultAsync(p => p.UserId == userId && !p.IsDeleted, ct);
        if (profile is null)
        {
            return ProfileErrors.NotFoundForUser(userId);
        }

        var query = _context.Posts
            .Include(p => p.Images)
            .Include(p => p.PostTags)
                .ThenInclude(pt => pt.Tag)
            .Where(p => p.ProfileId == profile.Id);

        if (request.Status.HasValue)
        {
            query = query.Where(p => p.Status == request.Status.Value);
        }

        var totalCount = await query.CountAsync(ct);

        var posts = await query
            .OrderByDescending(p => p.CreatedAt)
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(ct);

        // Resolve creator info
        PostCreatorDto? creator = null;
        var userResult = await _identityService.GetUserByIdAsync(userId, ct);
        if (userResult.IsSuccess)
        {
            var avatarUrl = profile.AvatarKey is not null
                ? _storageService.GetPublicUrl(profile.AvatarKey.Value)
                : null;

            creator = new PostCreatorDto(
                profile.Id,
                userResult.Value.UserName,
                profile.Name,
                avatarUrl);
        }

        var postIds = posts.Select(p => p.Id).ToList();
        var likedPostIds = new HashSet<Guid>();
        if (!string.IsNullOrWhiteSpace(userId) && postIds.Count > 0)
        {
            var likes = await _context.PostLikes
                .Where(l => postIds.Contains(l.PostId) && l.UserId == userId)
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
