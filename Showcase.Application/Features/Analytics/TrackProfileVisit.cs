using System;
using System.Security.Cryptography;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Showcase.Application.Common.Interfaces;
using Showcase.Application.Features.Notifications.Events;
using Showcase.Domain.Common.Results;
using Showcase.Domain.Entities;

namespace Showcase.Application.Features.Analytics;

public record TrackProfileVisitCommand(
    Guid ProfileId,
    string? IpAddress = null,
    string? VisitorToken = null) : IRequest<Result>;

public class TrackProfileVisitCommandHandler : IRequestHandler<TrackProfileVisitCommand, Result>
{
    private readonly ICurrentUserService _currentUserService;
    private readonly IApplicationDbContext _context;
    private readonly IPublisher _publisher;

    public TrackProfileVisitCommandHandler(
        ICurrentUserService currentUserService,
        IApplicationDbContext context,
        IPublisher publisher)
    {
        _currentUserService = currentUserService;
        _context = context;
        _publisher = publisher;
    }

    public async Task<Result> Handle(TrackProfileVisitCommand request, CancellationToken ct)
    {
        var profile = await _context.Profiles
            .FirstOrDefaultAsync(p => p.Id == request.ProfileId, ct);

        if (profile is null)
            return ProfileErrors.NotFoundById(request.ProfileId);

        var currentUserId = _currentUserService.UserId;

        // Avoid self-counting and self-notifying if creator views their own profile
        if (!string.IsNullOrWhiteSpace(currentUserId) && currentUserId == profile.UserId)
            return Result.Success();

        var rawIp = !string.IsNullOrWhiteSpace(request.IpAddress)
            ? request.IpAddress
            : _currentUserService.IpAddress ?? "127.0.0.1";
        var hashedIp = HashIp(rawIp);

        // 24 hour dedup check: registered user by userId, guest by visitorToken, fallback to hashedIp
        if (await IsDuplicateVisitAsync(request.ProfileId, currentUserId, request.VisitorToken, hashedIp, ct))
            return Result.Success();

        var isGuest = string.IsNullOrWhiteSpace(currentUserId);
        var visit = new ProfileVisit(
            request.ProfileId,
            hashedIp,
            isGuest ? null : currentUserId,
            request.VisitorToken);

        _context.ProfileVisits.Add(visit);
        await _context.SaveChangesAsync(ct);

        await _publisher.Publish(new ProfileVisitedNotificationEvent(
            profile.UserId,
            isGuest ? null : currentUserId,
            isGuest), ct);

        return Result.Success();
    }

    private static string HashIp(string ip) =>
        Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(ip)));

    private async Task<bool> IsDuplicateVisitAsync(
        Guid profileId,
        string? userId,
        string? visitorToken,
        string hashedIp,
        CancellationToken ct)
    {
        var since = DateTime.UtcNow.AddHours(-24);

        if (!string.IsNullOrWhiteSpace(userId))
        {
            return await _context.ProfileVisits
                .AnyAsync(v => v.ProfileId == profileId &&
                               v.VisitedAtUtc >= since &&
                               v.VisitorUserId == userId, ct);
        }

        if (!string.IsNullOrWhiteSpace(visitorToken))
        {
            return await _context.ProfileVisits
                .AnyAsync(v => v.ProfileId == profileId &&
                               v.VisitedAtUtc >= since &&
                               v.VisitorToken == visitorToken, ct);
        }

        return await _context.ProfileVisits
            .AnyAsync(v => v.ProfileId == profileId &&
                           v.VisitedAtUtc >= since &&
                           v.HashedIp == hashedIp, ct);
    }
}
