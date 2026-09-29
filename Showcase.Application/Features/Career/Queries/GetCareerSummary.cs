using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Showcase.Application.Common.Interfaces;
using Showcase.Application.Features.Career.Common;
using Showcase.Domain.Common.Results;
using Showcase.Domain.Entities;

namespace Showcase.Application.Features.Career.Queries;

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
        var userId = _currentUserService.UserId;
        if (string.IsNullOrWhiteSpace(userId))
            return Error.Unauthorized("Auth.Unauthenticated", "User is not authenticated.");

        var profile = await _context.Profiles
            .Include(p => p.Experiences)
            .Include(p => p.Academics)
            .Include(p => p.Skills)
            .Include(p => p.Credentials)
            .Include(p => p.Languages)
            .Include(p => p.Achievements)
            .Include(p => p.CareerVisibility)
            .FirstOrDefaultAsync(p => p.UserId == userId && !p.IsDeleted, ct);

        if (profile is null)
            return ProfileErrors.NotFoundForUser(userId);

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
