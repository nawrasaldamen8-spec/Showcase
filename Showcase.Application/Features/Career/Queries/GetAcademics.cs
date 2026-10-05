using Showcase.Application.Features.Career.Common;

namespace Showcase.Application.Features.Career.Queries;

using Showcase.Application.Features.Career.Common;

public record GetAcademicsQuery : IRequest<Result<IReadOnlyList<CareerAcademicDto>>>;

public class GetAcademicsQueryHandler(
    ICurrentUserService currentUserService,
    IApplicationDbContext context) : IRequestHandler<GetAcademicsQuery, Result<IReadOnlyList<CareerAcademicDto>>>
{
    private readonly ICurrentUserService _currentUserService = currentUserService;
    private readonly IApplicationDbContext _context = context;

    public async Task<Result<IReadOnlyList<CareerAcademicDto>>> Handle(GetAcademicsQuery request, CancellationToken ct)
    {
        var profileResult = await _context.GetActiveProfileByUserIdAsync(_currentUserService.UserId, ct);
        if (profileResult.IsFailure)
            return Result.Failure<IReadOnlyList<CareerAcademicDto>>(profileResult.Error);

        var profile = profileResult.Value;

        var list = await _context.Academics
            .Where(a => a.ProfileId == profile.Id)
            .OrderByDescending(a => a.Period.Start)
            .ToListAsync(ct);

        return list.Select(a => a.ToDto()).ToList();
    }
}

