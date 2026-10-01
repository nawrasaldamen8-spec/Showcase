using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Showcase.Application.Common.Interfaces;
using Showcase.Application.Common.Models;
using Showcase.Application.Features.Notifications.Common;
using Showcase.Domain.Common.Results;

namespace Showcase.Application.Features.Notifications;

public record GetNotificationsQuery(int PageNumber = 1, int PageSize = 20) : IRequest<Result<PaginatedList<NotificationDto>>>;

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

public class GetNotificationsQueryHandler : IRequestHandler<GetNotificationsQuery, Result<PaginatedList<NotificationDto>>>
{
    private readonly ICurrentUserService _currentUserService;
    private readonly IApplicationDbContext _context;
    private readonly IIdentityService _identityService;
    private readonly IStorageService _storageService;

    public GetNotificationsQueryHandler(
        ICurrentUserService currentUserService,
        IApplicationDbContext context,
        IIdentityService identityService,
        IStorageService storageService)
    {
        _currentUserService = currentUserService;
        _context = context;
        _identityService = identityService;
        _storageService = storageService;
    }

    public async Task<Result<PaginatedList<NotificationDto>>> Handle(GetNotificationsQuery request, CancellationToken ct)
    {
        var userId = _currentUserService.UserId;
        if (string.IsNullOrWhiteSpace(userId))
            return Error.Unauthorized("Auth.Unauthenticated", "User is not authenticated.");

        var totalCount = await _context.Notifications
            .Where(n => n.UserId == userId)
            .CountAsync(ct);

        if (totalCount == 0)
            return PaginatedList<NotificationDto>.Create(new List<NotificationDto>(), 0, request.PageNumber, request.PageSize);

        var rawList = await _context.Notifications
            .Where(n => n.UserId == userId)
            .OrderByDescending(n => n.CreatedAtUtc)
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(ct);

        var sourceUserIds = rawList
            .Where(n => !string.IsNullOrWhiteSpace(n.SourceUserId))
            .Select(n => n.SourceUserId!)
            .Distinct()
            .ToList();

        var sourcePostIds = rawList
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

        var dtos = rawList.Select(n =>
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
        }).ToList();

        return PaginatedList<NotificationDto>.Create(dtos, totalCount, request.PageNumber, request.PageSize);
    }
}
