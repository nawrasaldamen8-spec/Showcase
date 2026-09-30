using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Showcase.Application.Common.Interfaces;
using Showcase.Domain.Common.Results;
using Showcase.Domain.Entities;
using Showcase.Domain.Enums;

namespace Showcase.Application.Features.Admin.Broadcasts;

public record CreateBroadcastCommand(
    string Title,
    string Message,
    string Severity = "info",
    DateTime? ExpiresAt = null) : IRequest<Result>;

public class CreateBroadcastCommandValidator : AbstractValidator<CreateBroadcastCommand>
{
    public CreateBroadcastCommandValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Broadcast title is required.")
            .MaximumLength(150).WithMessage("Title must not exceed 150 characters.");

        RuleFor(x => x.Message)
            .NotEmpty().WithMessage("Broadcast message is required.")
            .MaximumLength(1000).WithMessage("Message must not exceed 1000 characters.");
    }
}

public class CreateBroadcastCommandHandler : IRequestHandler<CreateBroadcastCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly IRealtimeNotifier _realtimeNotifier;

    public CreateBroadcastCommandHandler(
        IApplicationDbContext context,
        IRealtimeNotifier realtimeNotifier)
    {
        _context = context;
        _realtimeNotifier = realtimeNotifier;
    }

    public async Task<Result> Handle(CreateBroadcastCommand request, CancellationToken ct)
    {
        // 1. Broadcast real-time message to all connected clients
        await _realtimeNotifier.BroadcastAsync(request.Title, request.Message, request.Severity, ct);

        // 2. Persist system notification for all active profiles
        var activeUserIds = await _context.Profiles
            .Where(p => !p.IsDeleted && !p.IsBanned)
            .Select(p => p.UserId)
            .ToListAsync(ct);

        if (activeUserIds.Count > 0)
        {
            var notifications = activeUserIds.Select(userId => new Notification(
                userId,
                NotificationType.System,
                request.Title,
                request.Message
            )).ToList();

            _context.Notifications.AddRange(notifications);
            await _context.SaveChangesAsync(ct);
        }

        return Result.Success();
    }
}
