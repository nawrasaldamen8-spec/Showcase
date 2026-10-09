using Showcase.Application.Features.Career.Common;

namespace Showcase.Application.Features.Career.Commands;

using Showcase.Application.Features.Career.Common;

public record ToggleSectionVisibilityCommand(
    string Section,
    bool IsVisible) : IRequest<Result<CareerVisibilityDto>>;

public class ToggleSectionVisibilityCommandHandler(
    ICurrentUserService currentUserService,
    IApplicationDbContext context) : IRequestHandler<ToggleSectionVisibilityCommand, Result<CareerVisibilityDto>>
{
    private readonly ICurrentUserService _currentUserService = currentUserService;
    private readonly IApplicationDbContext _context = context;

    public async Task<Result<CareerVisibilityDto>> Handle(ToggleSectionVisibilityCommand request, CancellationToken ct)
    {
        var profileResult = await _context.GetProfileWithCareerVisibilityAsync(_currentUserService.UserId, ct);
        if (profileResult.IsFailure)
            return Result.Failure<CareerVisibilityDto>(profileResult.Error);

        var profile = profileResult.Value;
        var toggleResult = profile.ToggleCareerSection(request.Section, request.IsVisible);
        if (toggleResult.IsFailure)
            return Result.Failure<CareerVisibilityDto>(toggleResult.Error);

        _context.CareerVisibilities.Update(profile.CareerVisibility);
        await _context.SaveChangesAsync(ct);

        return profile.CareerVisibility.ToDto();
    }
}

