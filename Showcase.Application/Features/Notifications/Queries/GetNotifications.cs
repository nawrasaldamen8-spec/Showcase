using Showcase.Application.Features.Notifications.Common;

namespace Showcase.Application.Features.Notifications.Queries;

using Showcase.Application.Features.Notifications.Common;

public record GetNotificationsQuery(int PageNumber = 1, int PageSize = 20) : IRequest<Result<PaginatedList<NotificationDto>>>, IPaginationRequest;

public class GetNotificationsQueryValidator : AbstractValidator<GetNotificationsQuery>
{
    public GetNotificationsQueryValidator()
    {
        RuleFor(x => x.PageNumber)
            .GreaterThanOrEqualTo(1).WithMessage("PageNumber must be at least 1.");

        RuleFor(x => x.PageSize)
            .InclusiveBetween(1, 100).WithMessage("PageSize must be between 1 and 100.");
    }
}

public class GetNotificationsQueryHandler(
    ICurrentUserService currentUserService,
    IApplicationDbContext context,
    IIdentityService identityService,
    IStorageService storageService) : IRequestHandler<GetNotificationsQuery, Result<PaginatedList<NotificationDto>>>
{
    private readonly ICurrentUserService _currentUserService = currentUserService;
    private readonly IApplicationDbContext _context = context;
    private readonly IIdentityService _identityService = identityService;
    private readonly IStorageService _storageService = storageService;

    public async Task<Result<PaginatedList<NotificationDto>>> Handle(GetNotificationsQuery request, CancellationToken ct)
    {
        var userId = _currentUserService.UserId;
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Error.Unauthorized("Auth.Unauthenticated", "User is not authenticated.");
        }

        var pagedNotifications = await _context.Notifications
            .Where(n => n.UserId == userId)
            .OrderByDescending(n => n.CreatedAtUtc)
            .ToPaginatedListAsync(request, ct);

        if (pagedNotifications.TotalCount == 0)
        {
            return PaginatedList<NotificationDto>.Empty(request.PageNumber, request.PageSize);
        }

        var sourceUserIds = pagedNotifications.Items
            .Where(n => !string.IsNullOrWhiteSpace(n.SourceUserId))
            .Select(n => n.SourceUserId!)
            .Distinct()
            .ToList();

        var sourcePostIds = pagedNotifications.Items
            .Where(n => n.SourcePostId.HasValue)
            .Select(n => n.SourcePostId!.Value)
            .Distinct()
            .ToList();

        var profiles = sourceUserIds.Count > 0
            ? await _context.Profiles
                .Where(p => sourceUserIds.Contains(p.UserId))
                .ToDictionaryAsync(p => p.UserId, ct)
            : new Dictionary<string, Domain.Entities.Profile>();

        var userMapResult = sourceUserIds.Count > 0
            ? await _identityService.GetUsersByIdsAsync(sourceUserIds, ct)
            : null;
        var usersDict = userMapResult?.IsSuccess == true ? userMapResult.Value : new Dictionary<string, UserIdentityDetails>();

        var posts = sourcePostIds.Count > 0
            ? await _context.Posts
                .Include(p => p.Images)
                .Where(p => sourcePostIds.Contains(p.Id))
                .ToDictionaryAsync(p => p.Id, ct)
            : new Dictionary<Guid, Domain.Entities.Post>();

        return pagedNotifications.Map(n =>
        {
            string? actorUsername = null;
            string? actorName = null;
            string? actorAvatarUrl = null;

            if (!string.IsNullOrWhiteSpace(n.SourceUserId))
            {
                if (profiles.TryGetValue(n.SourceUserId, out var prof))
                {
                    actorName = prof.Name;
                    actorAvatarUrl = prof.AvatarKey is not null
                        ? _storageService.GetPublicUrl(prof.AvatarKey.Value)
                        : null;
                }

                if (usersDict.TryGetValue(n.SourceUserId, out var uDetails))
                {
                    actorUsername = uDetails.UserName;
                }
            }

            string? postTitle = null;
            string? postCoverUrl = null;

            if (n.SourcePostId.HasValue && posts.TryGetValue(n.SourcePostId.Value, out var post))
            {
                postTitle = post.Title;
                var coverImage = post.Images.OrderBy(i => i.DisplayOrder).FirstOrDefault();
                if (coverImage != null)
                {
                    postCoverUrl = _storageService.GetPublicUrl(coverImage.StorageKey.Value);
                }
            }

            return new NotificationDto(
                n.Id,
                n.Type.ToString().ToLowerInvariant(),
                n.Title,
                n.Message,
                n.SourcePostId,
                n.SourceUserId,
                actorUsername,
                actorName,
                actorAvatarUrl,
                postTitle,
                postCoverUrl,
                n.IsRead,
                n.CreatedAtUtc);
        });
    }
}

