using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Showcase.Application.Common.Interfaces;
using Showcase.Domain.Common.Results;
using Showcase.Domain.Entities;
using Showcase.Domain.Enums;

namespace Showcase.Application.Features.Admin.Featured;

public record ApproveFeaturedRequestCommand(
    Guid Id,
    string? Note = null) : IRequest<Result>;

public class ApproveFeaturedRequestCommandHandler : IRequestHandler<ApproveFeaturedRequestCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly IPublisher _publisher;

    public ApproveFeaturedRequestCommandHandler(
        IApplicationDbContext context,
        IPublisher publisher)
    {
        _context = context;
        _publisher = publisher;
    }

    public async Task<Result> Handle(ApproveFeaturedRequestCommand request, CancellationToken ct)
    {
        var featuredReq = await _context.FeaturedRequests
            .FirstOrDefaultAsync(f => f.Id == request.Id, ct);

        if (featuredReq is null)
            return Error.NotFound("FeaturedRequest.NotFound", $"Featured request '{request.Id}' was not found.");

        var approveResult = featuredReq.Approve(request.Note);
        if (approveResult.IsFailure)
            return approveResult;

        var profile = await _context.Profiles
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(p => p.UserId == featuredReq.UserId, ct);

        if (profile is not null)
        {
            profile.SetFeaturedStatus(FeaturedStatus.Featured);
        }

        await _context.SaveChangesAsync(ct);

        await _publisher.Publish(new Showcase.Application.Features.Notifications.Events.FeaturedApprovedNotificationEvent(
            featuredReq.UserId,
            request.Note), ct);

        return Result.Success();
    }
}
