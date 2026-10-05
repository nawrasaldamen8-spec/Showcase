using Showcase.Application.Features.Notifications.Common;

namespace Showcase.Application.Features.Notifications.Queries;

using Showcase.Application.Features.Notifications.Common;

public record GetUnreadNotificationsCountQuery : IRequest<Result<UnreadCountResponse>>;

public class GetUnreadNotificationsCountQueryHandler(
    ICurrentUserService currentUserService,
    IApplicationDbContext context) : IRequestHandler<GetUnreadNotificationsCountQuery, Result<UnreadCountResponse>>
{
    private readonly ICurrentUserService _currentUserService = currentUserService;
    private readonly IApplicationDbContext _context = context;

    public async Task<Result<UnreadCountResponse>> Handle(GetUnreadNotificationsCountQuery request, CancellationToken ct)
    {
        var userId = _currentUserService.UserId;
        if (string.IsNullOrWhiteSpace(userId))
            return Error.Unauthorized("Auth.Unauthenticated", "User is not authenticated.");

        var unreadCount = await _context.Notifications
            .Where(n => n.UserId == userId && !n.IsRead)
            .CountAsync(ct);

        return new UnreadCountResponse(unreadCount);
    }
}

