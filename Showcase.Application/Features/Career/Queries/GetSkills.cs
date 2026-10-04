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

public record GetSkillsQuery : IRequest<Result<IReadOnlyList<CareerSkillDto>>>;

public class GetSkillsQueryHandler : IRequestHandler<GetSkillsQuery, Result<IReadOnlyList<CareerSkillDto>>>
{
    private readonly ICurrentUserService _currentUserService;
    private readonly IApplicationDbContext _context;

    public GetSkillsQueryHandler(
        ICurrentUserService currentUserService,
        IApplicationDbContext context)
    {
        _currentUserService = currentUserService;
        _context = context;
    }

    public async Task<Result<IReadOnlyList<CareerSkillDto>>> Handle(GetSkillsQuery request, CancellationToken ct)
    {
        var profileResult = await _context.GetActiveProfileByUserIdAsync(_currentUserService.UserId, ct);
        if (profileResult.IsFailure)
            return Result.Failure<IReadOnlyList<CareerSkillDto>>(profileResult.Error);

        var profile = profileResult.Value;

        var list = await _context.Skills
            .Where(s => s.ProfileId == profile.Id)
            .OrderBy(s => s.Name)
            .ToListAsync(ct);

        return list.Select(s => s.ToDto()).ToList();
    }
}

