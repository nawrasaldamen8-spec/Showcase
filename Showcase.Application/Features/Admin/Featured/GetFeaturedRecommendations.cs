using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Showcase.Application.Common.Interfaces;
using Showcase.Application.Features.Admin.Common;
using Showcase.Domain.Common.Results;
using Showcase.Domain.Enums;

namespace Showcase.Application.Features.Admin.Featured;

public record GetFeaturedRecommendationsQuery : IRequest<Result<IReadOnlyList<FeaturedRecommendationItemDto>>>;

public class GetFeaturedRecommendationsQueryHandler : IRequestHandler<GetFeaturedRecommendationsQuery, Result<IReadOnlyList<FeaturedRecommendationItemDto>>>
{
    private readonly IApplicationDbContext _context;
    private readonly IIdentityService _identityService;
    private readonly IStorageService _storageService;

    public GetFeaturedRecommendationsQueryHandler(
        IApplicationDbContext context,
        IIdentityService identityService,
        IStorageService storageService)
    {
        _context = context;
        _identityService = identityService;
        _storageService = storageService;
    }

    public async Task<Result<IReadOnlyList<FeaturedRecommendationItemDto>>> Handle(GetFeaturedRecommendationsQuery request, CancellationToken ct)
    {
        var requests = await _context.FeaturedRequests
            .OrderByDescending(f => f.CreatedAtUtc)
            .Take(100)
            .ToListAsync(ct);

        var list = new List<FeaturedRecommendationItemDto>();

        foreach (var req in requests)
        {
            var userResult = await _identityService.GetUserByIdAsync(req.UserId, ct);
            var username = userResult.IsSuccess ? userResult.Value.UserName : "unknown";

            var profile = await _context.Profiles.FirstOrDefaultAsync(p => p.UserId == req.UserId, ct);
            var name = profile?.Name ?? username;
            var avatarUrl = profile?.AvatarKey is not null
                ? _storageService.GetPublicUrl(profile.AvatarKey.Value)
                : null;

            var postsCount = profile is not null
                ? await _context.Posts.CountAsync(p => p.ProfileId == profile.Id && p.Status == PostStatus.Published, ct)
                : 0;

            list.Add(new FeaturedRecommendationItemDto(
                req.Id,
                req.UserId,
                username,
                name,
                avatarUrl,
                profile?.Specialty,
                postsCount,
                req.Status == FeaturedStatus.Featured,
                req.Status.ToString().ToLowerInvariant(),
                req.CreatedAtUtc));
        }

        return list;
    }
}
