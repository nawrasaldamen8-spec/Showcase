using Showcase.Application.Features.Career.Common;

namespace Showcase.Application.Features.Career.Queries;

using Showcase.Application.Features.Career.Common;

public record GetCredentialsQuery : IRequest<Result<IReadOnlyList<CareerCredentialDto>>>;

public class GetCredentialsQueryHandler(
    ICurrentUserService currentUserService,
    IApplicationDbContext context) : IRequestHandler<GetCredentialsQuery, Result<IReadOnlyList<CareerCredentialDto>>>
{
    private readonly ICurrentUserService _currentUserService = currentUserService;
    private readonly IApplicationDbContext _context = context;

    public async Task<Result<IReadOnlyList<CareerCredentialDto>>> Handle(GetCredentialsQuery request, CancellationToken ct)
    {
        var profileResult = await _context.GetActiveProfileByUserIdAsync(_currentUserService.UserId, ct);
        if (profileResult.IsFailure)
            return Result.Failure<IReadOnlyList<CareerCredentialDto>>(profileResult.Error);

        var profile = profileResult.Value;

        var list = await _context.Credentials
            .Where(c => c.ProfileId == profile.Id)
            .OrderByDescending(c => c.Validity.Start)
            .ToListAsync(ct);

        return list.Select(c => c.ToDto()).ToList();
    }
}

