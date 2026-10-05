using Showcase.Application.Features.Career.Common;

namespace Showcase.Application.Features.Career.Queries;

using Showcase.Application.Features.Career.Common;

public record GetCareerSummaryQuery : IRequest<Result<CareerSummaryResponse>>;

public class GetCareerSummaryQueryHandler(
    ICurrentUserService currentUserService,
    IApplicationDbContext context) : IRequestHandler<GetCareerSummaryQuery, Result<CareerSummaryResponse>>
{
    private readonly ICurrentUserService _currentUserService = currentUserService;
    private readonly IApplicationDbContext _context = context;

    public async Task<Result<CareerSummaryResponse>> Handle(GetCareerSummaryQuery request, CancellationToken ct)
    {
        var profileResult = await _context.GetProfileWithCareerDataAsync(_currentUserService.UserId, ct);
        if (profileResult.IsFailure)
            return Result.Failure<CareerSummaryResponse>(profileResult.Error);

        var profile = profileResult.Value;

        var vis = profile.CareerVisibility;
        var visibilityDto = vis is not null
            ? new CareerVisibilityDto(vis.Experience, vis.Academics, vis.Skills, vis.Credentials, vis.Languages, vis.Achievements)
            : new CareerVisibilityDto(true, true, true, true, true, true);

        return new CareerSummaryResponse(
            profile.Experiences.Count,
            profile.Academics.Count,
            profile.Skills.Count,
            profile.Credentials.Count,
            profile.Languages.Count,
            profile.Achievements.Count,
            visibilityDto);
    }
}

