using Showcase.Application.Features.Career.Common;

namespace Showcase.Application.Features.Career.Queries;

using Showcase.Application.Features.Career.Common;

public record GetAchievementsQuery : IRequest<Result<IReadOnlyList<CareerAchievementDto>>>;

public class GetAchievementsQueryHandler(
    ICurrentUserService currentUserService,
    IApplicationDbContext context) : IRequestHandler<GetAchievementsQuery, Result<IReadOnlyList<CareerAchievementDto>>>
{
    private readonly ICurrentUserService _currentUserService = currentUserService;
    private readonly IApplicationDbContext _context = context;

    public async Task<Result<IReadOnlyList<CareerAchievementDto>>> Handle(GetAchievementsQuery request, CancellationToken ct)
    {
        var profileResult = await _context.GetActiveProfileByUserIdAsync(_currentUserService.UserId, ct);
        if (profileResult.IsFailure)
            return Result.Failure<IReadOnlyList<CareerAchievementDto>>(profileResult.Error);

        var profile = profileResult.Value;

        var list = await _context.Achievements
            .Where(a => a.ProfileId == profile.Id)
            .OrderByDescending(a => a.Date)
            .ToListAsync(ct);

        return list.Select(a => a.ToDto()).ToList();
    }
}

