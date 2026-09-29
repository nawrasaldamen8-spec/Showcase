using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Showcase.Application.Common.Interfaces;
using Showcase.Domain.Common.Results;

namespace Showcase.Application.Features.Notifications;

public record MarkAllNotificationsAsReadCommand : IRequest<Result>;

public class MarkAllNotificationsAsReadCommandHandler : IRequestHandler<MarkAllNotificationsAsReadCommand, Result>
{
    private readonly ICurrentUserService _currentUserService;
    private readonly IApplicationDbContext _context;

    public MarkAllNotificationsAsReadCommandHandler(
        ICurrentUserService currentUserService,
        IApplicationDbContext context)
    {
        _currentUserService = currentUserService;
        _context = context;
    }

    public async Task<Result> Handle(MarkAllNotificationsAsReadCommand request, CancellationToken ct)
    {
        var userId = _currentUserService.UserId;
        if (string.IsNullOrWhiteSpace(userId))
            return Error.Unauthorized("Auth.Unauthenticated", "User is not authenticated.");

        var unreadNotifications = await _context.Notifications
            .Where(n => n.UserId == userId && !n.IsRead)
            .ToListAsync(ct);

        foreach (var notification in unreadNotifications)
        {
            notification.MarkAsRead();
        }

        await _context.SaveChangesAsync(ct);
        return Result.Success();
    }
}
