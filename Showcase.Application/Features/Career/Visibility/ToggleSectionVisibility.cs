using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Showcase.Application.Common.Extensions;
using Showcase.Application.Common.Interfaces;
using Showcase.Application.Features.Career.Common;
using Showcase.Domain.Common.Results;
using Showcase.Domain.Entities;

namespace Showcase.Application.Features.Career.Visibility;

public record ToggleSectionVisibilityCommand(
    string Section,
    bool IsVisible) : IRequest<Result<CareerVisibilityDto>>;

public class ToggleSectionVisibilityCommandHandler : IRequestHandler<ToggleSectionVisibilityCommand, Result<CareerVisibilityDto>>
{
    private readonly ICurrentUserService _currentUserService;
    private readonly IApplicationDbContext _context;

    public ToggleSectionVisibilityCommandHandler(
        ICurrentUserService currentUserService,
        IApplicationDbContext context)
    {
        _currentUserService = currentUserService;
        _context = context;
    }

    public async Task<Result<CareerVisibilityDto>> Handle(ToggleSectionVisibilityCommand request, CancellationToken ct)
    {
        var profileResult = await _context.GetProfileWithCareerVisibilityAsync(_currentUserService.UserId, ct);
        if (profileResult.IsFailure)
            return Result.Failure<CareerVisibilityDto>(profileResult.Error);

        var profile = profileResult.Value;
        var vis = profile.CareerVisibility;
        bool exp = vis.Experience;
        bool aca = vis.Academics;
        bool skl = vis.Skills;
        bool crd = vis.Credentials;
        bool lng = vis.Languages;
        bool ach = vis.Achievements;

        switch (request.Section.Trim().ToLowerInvariant())
        {
            case "experience": exp = request.IsVisible; break;
            case "academics": aca = request.IsVisible; break;
            case "skills": skl = request.IsVisible; break;
            case "credentials": crd = request.IsVisible; break;
            case "languages": lng = request.IsVisible; break;
            case "achievements": ach = request.IsVisible; break;
            default:
                return Error.Validation("CareerVisibility.InvalidSection", $"Unknown career section: '{request.Section}'.");
        }

        profile.UpdateVisibility(exp, aca, skl, crd, lng, ach);
        await _context.SaveChangesAsync(ct);

        return profile.CareerVisibility.ToDto();
    }
}
