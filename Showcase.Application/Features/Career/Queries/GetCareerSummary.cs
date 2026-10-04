using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Showcase.Application.Common.Extensions;
using Showcase.Application.Common.Interfaces;
using Showcase.Application.Features.Career.Common;
using Showcase.Domain.Common.Results;
using Showcase.Domain.Entities;

namespace Showcase.Application.Features.Career.Queries;
using Showcase.Application.Features.Career.Common;

public record GetCareerSummaryQuery : IRequest<Result<CareerSummaryResponse>>;

public class GetCareerSummaryQueryHandler : IRequestHandler<GetCareerSummaryQuery, Result<CareerSummaryResponse>>
{
    private readonly ICurrentUserService _currentUserService;
    private readonly IApplicationDbContext _context;

    public GetCareerSummaryQueryHandler(
        ICurrentUserService currentUserService,
        IApplicationDbContext context)
    {
        _currentUserService = currentUserService;
        _context = context;
    }

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

