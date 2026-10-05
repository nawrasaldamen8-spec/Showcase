using Showcase.Application.Features.Career.Common;

namespace Showcase.Application.Features.Career.Queries;

using Showcase.Application.Features.Career.Common;

public record GetCareerVisibilityQuery : IRequest<Result<CareerVisibilityDto>>;

public class GetCareerVisibilityQueryHandler(
    ICurrentUserService currentUserService,
    IApplicationDbContext context) : IRequestHandler<GetCareerVisibilityQuery, Result<CareerVisibilityDto>>
{
    private readonly ICurrentUserService _currentUserService = currentUserService;
    private readonly IApplicationDbContext _context = context;

    public async Task<Result<CareerVisibilityDto>> Handle(GetCareerVisibilityQuery request, CancellationToken ct)
    {
        var profileResult = await _context.GetProfileWithCareerVisibilityAsync(_currentUserService.UserId, ct);
        if (profileResult.IsFailure)
            return Result.Failure<CareerVisibilityDto>(profileResult.Error);

        return profileResult.Value.CareerVisibility.ToDto();
    }
}

