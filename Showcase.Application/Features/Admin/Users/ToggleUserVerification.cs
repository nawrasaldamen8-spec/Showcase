using System;
using System.Threading;
using System.Threading.Tasks;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Showcase.Application.Common.Interfaces;
using Showcase.Application.Features.Notifications.Events;
using Showcase.Domain.Common.Results;

namespace Showcase.Application.Features.Admin.Users;

public record ToggleUserVerificationCommand(
    string UserId,
    bool IsVerified,
    string? Note = null) : IRequest<Result>;

public class ToggleUserVerificationCommandValidator : AbstractValidator<ToggleUserVerificationCommand>
{
    public ToggleUserVerificationCommandValidator()
    {
        RuleFor(x => x.UserId)
            .NotEmpty().WithMessage("User ID is required.");
    }
}

public class ToggleUserVerificationCommandHandler : IRequestHandler<ToggleUserVerificationCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly IPublisher _publisher;

    public ToggleUserVerificationCommandHandler(
        IApplicationDbContext context,
        IPublisher publisher)
    {
        _context = context;
        _publisher = publisher;
    }

    public async Task<Result> Handle(ToggleUserVerificationCommand request, CancellationToken ct)
    {
        var profile = await _context.Profiles
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(p => p.UserId == request.UserId, ct);

        if (profile is null)
        {
            return Error.NotFound("Profile.NotFound", $"Profile for user '{request.UserId}' was not found.");
        }

        profile.MarkVerified(request.IsVerified);

        // Update any active verification request if present
        var pendingReq = await _context.VerificationRequests
            .Where(v => v.UserId == request.UserId && v.Status == Showcase.Domain.Enums.VerificationStatus.Pending)
            .FirstOrDefaultAsync(ct);

        if (pendingReq is not null)
        {
            if (request.IsVerified)
            {
                pendingReq.Approve(request.Note);
            }
            else
            {
                pendingReq.Reject(request.Note ?? "Verification removed by administrator.");
            }
        }

        await _context.SaveChangesAsync(ct);

        if (request.IsVerified)
        {
            await _publisher.Publish(new VerificationApprovedNotificationEvent(
                request.UserId,
                request.Note ?? "Congratulations! Your profile has been granted a verified creator badge."), ct);
        }
        else
        {
            await _publisher.Publish(new VerificationRejectedNotificationEvent(
                request.UserId,
                request.Note ?? "Your verified badge has been revoked by administration."), ct);
        }

        return Result.Success();
    }
}
