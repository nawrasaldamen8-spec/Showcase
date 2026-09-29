using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Showcase.Application.Common.Interfaces;
using Showcase.Domain.Common.Results;
using Showcase.Domain.Entities;
using Showcase.Domain.Enums;

namespace Showcase.Application.Features.Analytics;

public record ProfileAnalyticsDto(
    int TotalViews,
    int UniqueVisitors,
    int TotalLikes,
    int TotalPosts);

public record GetProfileAnalyticsQuery : IRequest<Result<ProfileAnalyticsDto>>;

public class GetProfileAnalyticsQueryHandler : IRequestHandler<GetProfileAnalyticsQuery, Result<ProfileAnalyticsDto>>
{
    private readonly ICurrentUserService _currentUserService;
    private readonly IApplicationDbContext _context;

    public GetProfileAnalyticsQueryHandler(
        ICurrentUserService currentUserService,
        IApplicationDbContext context)
    {
        _currentUserService = currentUserService;
        _context = context;
    }

    public async Task<Result<ProfileAnalyticsDto>> Handle(GetProfileAnalyticsQuery request, CancellationToken ct)
    {
        var userId = _currentUserService.UserId;
        if (string.IsNullOrWhiteSpace(userId))
            return Error.Unauthorized("Auth.Unauthenticated", "User is not authenticated.");

        var profile = await _context.Profiles
            .FirstOrDefaultAsync(p => p.UserId == userId && !p.IsDeleted, ct);

        if (profile is null)
            return ProfileErrors.NotFoundForUser(userId);

        var totalViews = await _context.ProfileVisits
            .CountAsync(v => v.ProfileId == profile.Id, ct);

        var uniqueVisitors = await _context.ProfileVisits
            .Where(v => v.ProfileId == profile.Id)
            .Select(v => v.HashedIp)
            .Distinct()
            .CountAsync(ct);

        var posts = await _context.Posts
            .Where(p => p.ProfileId == profile.Id && p.Status == PostStatus.Published)
            .ToListAsync(ct);

        var totalLikes = posts.Sum(p => p.LikesCount);
        var totalPosts = posts.Count;

        return new ProfileAnalyticsDto(
            totalViews,
            uniqueVisitors,
            totalLikes,
            totalPosts);
    }
}
