using System;
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

public record GetAchievementsQuery : IRequest<Result<IReadOnlyList<CareerAchievementDto>>>;

public class GetAchievementsQueryHandler : IRequestHandler<GetAchievementsQuery, Result<IReadOnlyList<CareerAchievementDto>>>
{
    private readonly ICurrentUserService _currentUserService;
    private readonly IApplicationDbContext _context;

    public GetAchievementsQueryHandler(
        ICurrentUserService currentUserService,
        IApplicationDbContext context)
    {
        _currentUserService = currentUserService;
        _context = context;
    }

    public async Task<Result<IReadOnlyList<CareerAchievementDto>>> Handle(GetAchievementsQuery request, CancellationToken ct)
    {
        var profileResult = await _context.GetActiveProfileByUserIdAsync(_currentUserService.UserId, ct);
        if (profileResult.IsFailure)
            return Result.Failure<IReadOnlyList<CareerAchievementDto>>(profileResult.Error);

        var profile = profileResult.Value;

        var list = await _context.Achievements
            .Where(a => a.ProfileId == profile.Id)
            .OrderByDescending(a => a.Date)
            .ToListAsync(ct);

        return list.Select(a => a.ToDto()).ToList();
    }
}

