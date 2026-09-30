using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Showcase.Application.Common.Interfaces;
using Showcase.Application.Features.Notifications.Common;
using Showcase.Domain.Common.Results;

namespace Showcase.Application.Features.Notifications;

public record GetNotificationsQuery(int Limit = 50) : IRequest<Result<IReadOnlyList<NotificationDto>>>;

public class GetNotificationsQueryValidator : AbstractValidator<GetNotificationsQuery>
{
    public GetNotificationsQueryValidator()
    {
        RuleFor(x => x.Limit)
            .InclusiveBetween(1, 100).WithMessage("Limit must be between 1 and 100.");
    }
}

public class GetNotificationsQueryHandler : IRequestHandler<GetNotificationsQuery, Result<IReadOnlyList<NotificationDto>>>
{
    private readonly ICurrentUserService _currentUserService;
    private readonly IApplicationDbContext _context;

    public GetNotificationsQueryHandler(
        ICurrentUserService currentUserService,
        IApplicationDbContext context)
    {
        _currentUserService = currentUserService;
        _context = context;
    }

    public async Task<Result<IReadOnlyList<NotificationDto>>> Handle(GetNotificationsQuery request, CancellationToken ct)
    {
        var userId = _currentUserService.UserId;
        if (string.IsNullOrWhiteSpace(userId))
            return Error.Unauthorized("Auth.Unauthenticated", "User is not authenticated.");

        var notifications = await _context.Notifications
            .Where(n => n.UserId == userId)
            .OrderByDescending(n => n.CreatedAtUtc)
            .Take(request.Limit)
            .Select(n => new NotificationDto(
                n.Id,
                n.Type.ToString().ToLowerInvariant(),
                n.Title,
                n.Message,
                n.SourcePostId,
                n.SourceUserId,
                n.IsRead,
                n.CreatedAtUtc))
            .ToListAsync(ct);

        return notifications;
    }
}
