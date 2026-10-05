using Showcase.Application.Features.Career.Common;

namespace Showcase.Application.Features.Career.Queries;

using Showcase.Application.Features.Career.Common;

public record GetSkillsQuery : IRequest<Result<IReadOnlyList<CareerSkillDto>>>;

public class GetSkillsQueryHandler(
    ICurrentUserService currentUserService,
    IApplicationDbContext context) : IRequestHandler<GetSkillsQuery, Result<IReadOnlyList<CareerSkillDto>>>
{
    private readonly ICurrentUserService _currentUserService = currentUserService;
    private readonly IApplicationDbContext _context = context;

    public async Task<Result<IReadOnlyList<CareerSkillDto>>> Handle(GetSkillsQuery request, CancellationToken ct)
    {
        var profileResult = await _context.GetActiveProfileByUserIdAsync(_currentUserService.UserId, ct);
        if (profileResult.IsFailure)
            return Result.Failure<IReadOnlyList<CareerSkillDto>>(profileResult.Error);

        var profile = profileResult.Value;

        var list = await _context.Skills
            .Where(s => s.ProfileId == profile.Id)
            .OrderBy(s => s.Name)
            .ToListAsync(ct);

        return list.Select(s => s.ToDto()).ToList();
    }
}

