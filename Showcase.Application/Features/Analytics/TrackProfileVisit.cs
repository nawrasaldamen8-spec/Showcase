using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Showcase.Application.Common.Interfaces;
using Showcase.Domain.Common.Results;
using Showcase.Domain.Entities;

namespace Showcase.Application.Features.Analytics;

public record TrackProfileVisitCommand(
    Guid ProfileId,
    string HashedIp,
    string? VisitorToken = null) : IRequest<Result>;

public class TrackProfileVisitCommandHandler : IRequestHandler<TrackProfileVisitCommand, Result>
{
    private readonly ICurrentUserService _currentUserService;
    private readonly IApplicationDbContext _context;

    public TrackProfileVisitCommandHandler(
        ICurrentUserService currentUserService,
        IApplicationDbContext context)
    {
        _currentUserService = currentUserService;
        _context = context;
    }

    public async Task<Result> Handle(TrackProfileVisitCommand request, CancellationToken ct)
    {
        var profile = await _context.Profiles
            .FirstOrDefaultAsync(p => p.Id == request.ProfileId, ct);

        if (profile is null)
            return ProfileErrors.NotFoundById(request.ProfileId);

        // Avoid self-counting
        if (_currentUserService.UserId == profile.UserId)
            return Result.Success();

        // 24 hour dedup check per visitorToken or hashedIp
        var since = DateTime.UtcNow.AddHours(-24);
        var alreadyVisited = await _context.ProfileVisits
            .AnyAsync(v => v.ProfileId == request.ProfileId &&
                           v.VisitedAtUtc >= since &&
                           (v.HashedIp == request.HashedIp || (request.VisitorToken != null && v.VisitorToken == request.VisitorToken)), ct);

        if (!alreadyVisited)
        {
            var visit = new ProfileVisit(
                request.ProfileId,
                request.HashedIp,
                _currentUserService.UserId,
                request.VisitorToken);

            _context.ProfileVisits.Add(visit);
            await _context.SaveChangesAsync(ct);
        }

        return Result.Success();
    }
}
