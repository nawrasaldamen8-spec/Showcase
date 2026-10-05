using Showcase.Application.Features.Career.Common;

namespace Showcase.Application.Features.Career.Queries;

using Showcase.Application.Features.Career.Common;

public record GetExperiencesQuery : IRequest<Result<IReadOnlyList<CareerExperienceDto>>>;

public class GetExperiencesQueryHandler(
    ICurrentUserService currentUserService,
    IApplicationDbContext context) : IRequestHandler<GetExperiencesQuery, Result<IReadOnlyList<CareerExperienceDto>>>
{
    private readonly ICurrentUserService _currentUserService = currentUserService;
    private readonly IApplicationDbContext _context = context;

    public async Task<Result<IReadOnlyList<CareerExperienceDto>>> Handle(GetExperiencesQuery request, CancellationToken ct)
    {
        var profileResult = await _context.GetActiveProfileByUserIdAsync(_currentUserService.UserId, ct);
        if (profileResult.IsFailure)
            return Result.Failure<IReadOnlyList<CareerExperienceDto>>(profileResult.Error);

        var profile = profileResult.Value;

        var list = await _context.Experiences
            .Where(e => e.ProfileId == profile.Id)
            .OrderByDescending(e => e.Period.Start)
            .ToListAsync(ct);

        return list.Select(e => e.ToDto()).ToList();
    }
}

