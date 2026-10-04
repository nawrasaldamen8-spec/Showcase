using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Showcase.Application.Common.Extensions;
using Showcase.Application.Common.Interfaces;
using Showcase.Application.Features.Career.Common;
using Showcase.Domain.Common.Results;
using Showcase.Domain.Entities;

namespace Showcase.Application.Features.Career.Queries;
using Showcase.Application.Features.Career.Common;

public record GetExperiencesQuery : IRequest<Result<IReadOnlyList<CareerExperienceDto>>>;

public class GetExperiencesQueryHandler : IRequestHandler<GetExperiencesQuery, Result<IReadOnlyList<CareerExperienceDto>>>
{
    private readonly ICurrentUserService _currentUserService;
    private readonly IApplicationDbContext _context;

    public GetExperiencesQueryHandler(
        ICurrentUserService currentUserService,
        IApplicationDbContext context)
    {
        _currentUserService = currentUserService;
        _context = context;
    }

    public async Task<Result<IReadOnlyList<CareerExperienceDto>>> Handle(GetExperiencesQuery request, CancellationToken ct)
    {
        var profileResult = await _context.GetActiveProfileByUserIdAsync(_currentUserService.UserId, ct);
        if (profileResult.IsFailure)
            return Result.Failure<IReadOnlyList<CareerExperienceDto>>(profileResult.Error);

        var profile = profileResult.Value;

        var list = await _context.Experiences
            .Where(e => e.ProfileId == profile.Id)
            .OrderByDescending(e => e.Period.Start)
            .ToListAsync(ct);

        return list.Select(e => e.ToDto()).ToList();
    }
}

