using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Showcase.Application.Common.Interfaces;
using Showcase.Application.Features.Admin.Common;
using Showcase.Domain.Common.Results;
using Showcase.Domain.Enums;

namespace Showcase.Application.Features.Admin.Dashboard;

public record GetDashboardMetricsQuery : IRequest<Result<AdminDashboardMetricsDto>>;

public class GetDashboardMetricsQueryHandler : IRequestHandler<GetDashboardMetricsQuery, Result<AdminDashboardMetricsDto>>
{
    private readonly IApplicationDbContext _context;

    public GetDashboardMetricsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<AdminDashboardMetricsDto>> Handle(GetDashboardMetricsQuery request, CancellationToken ct)
    {
        var totalUsers = await _context.Profiles.IgnoreQueryFilters().Where(p => !p.IsDeleted).CountAsync(ct);
        var activeCreators = await _context.Profiles.CountAsync(p => !p.IsBanned && !p.IsDeleted, ct);
        var publishedPosts = await _context.Posts.CountAsync(p => p.Status == PostStatus.Published, ct);
        var pendingVerifications = await _context.VerificationRequests.CountAsync(v => v.Status == VerificationStatus.Pending, ct);
        var featuredNominations = await _context.FeaturedRequests.CountAsync(f => f.Status == FeaturedStatus.Pending, ct);

        // Approximate storage metrics
        var totalPostImages = await _context.PostImages.CountAsync(ct);
        var totalAvatars = await _context.Profiles.CountAsync(p => p.AvatarKey != null, ct);
        long estimatedBytes = (totalPostImages * 850_000L) + (totalAvatars * 250_000L); // ~850KB per image, ~250KB per avatar
        long quotaBytes = 50L * 1024 * 1024 * 1024; // 50GB quota
        double quotaPercentage = quotaBytes > 0 ? (double)estimatedBytes / quotaBytes * 100.0 : 0.0;

        return new AdminDashboardMetricsDto(
            totalUsers,
            activeCreators,
            publishedPosts,
            pendingVerifications,
            0, // pending reports
            featuredNominations,
            estimatedBytes,
            quotaPercentage);
    }
}
