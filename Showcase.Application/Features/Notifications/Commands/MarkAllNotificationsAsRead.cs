namespace Showcase.Application.Features.Notifications.Commands;

using Showcase.Application.Features.Notifications.Common;

public record MarkAllNotificationsAsReadCommand : IRequest<Result>;

public class MarkAllNotificationsAsReadCommandHandler(
    ICurrentUserService currentUserService,
    IApplicationDbContext context) : IRequestHandler<MarkAllNotificationsAsReadCommand, Result>
{
    private readonly ICurrentUserService _currentUserService = currentUserService;
    private readonly IApplicationDbContext _context = context;

    public async Task<Result> Handle(MarkAllNotificationsAsReadCommand request, CancellationToken ct)
    {
        var userId = _currentUserService.UserId;
        if (string.IsNullOrWhiteSpace(userId))
            return Error.Unauthorized("Auth.Unauthenticated", "User is not authenticated.");

        await _context.Notifications
            .Where(n => n.UserId == userId && !n.IsRead)
            .ExecuteUpdateAsync(s => s.SetProperty(n => n.IsRead, true), ct);

        return Result.Success();
    }
}

