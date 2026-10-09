using Showcase.Application.Features.Career.Common;

namespace Showcase.Application.Features.Career.Commands;

using Showcase.Application.Features.Career.Common;

public record UpdateCareerVisibilityCommand(
    bool Experience,
    bool Academics,
    bool Skills,
    bool Credentials,
    bool Languages,
    bool Achievements) : IRequest<Result<CareerVisibilityDto>>;

public class UpdateCareerVisibilityCommandHandler(
    ICurrentUserService currentUserService,
    IApplicationDbContext context) : IRequestHandler<UpdateCareerVisibilityCommand, Result<CareerVisibilityDto>>
{
    private readonly ICurrentUserService _currentUserService = currentUserService;
    private readonly IApplicationDbContext _context = context;

    public async Task<Result<CareerVisibilityDto>> Handle(UpdateCareerVisibilityCommand request, CancellationToken ct)
    {
        var profileResult = await _context.GetProfileWithCareerVisibilityAsync(_currentUserService.UserId, ct);
        if (profileResult.IsFailure)
            return Result.Failure<CareerVisibilityDto>(profileResult.Error);

        var profile = profileResult.Value;

        profile.UpdateVisibility(
            request.Experience,
            request.Academics,
            request.Skills,
            request.Credentials,
            request.Languages,
            request.Achievements);

        _context.CareerVisibilities.Update(profile.CareerVisibility);
        await _context.SaveChangesAsync(ct);

        return profile.CareerVisibility.ToDto();
    }
}

