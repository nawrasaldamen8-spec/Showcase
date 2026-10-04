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

public record GetAcademicsQuery : IRequest<Result<IReadOnlyList<CareerAcademicDto>>>;

public class GetAcademicsQueryHandler : IRequestHandler<GetAcademicsQuery, Result<IReadOnlyList<CareerAcademicDto>>>
{
    private readonly ICurrentUserService _currentUserService;
    private readonly IApplicationDbContext _context;

    public GetAcademicsQueryHandler(
        ICurrentUserService currentUserService,
        IApplicationDbContext context)
    {
        _currentUserService = currentUserService;
        _context = context;
    }

    public async Task<Result<IReadOnlyList<CareerAcademicDto>>> Handle(GetAcademicsQuery request, CancellationToken ct)
    {
        var profileResult = await _context.GetActiveProfileByUserIdAsync(_currentUserService.UserId, ct);
        if (profileResult.IsFailure)
            return Result.Failure<IReadOnlyList<CareerAcademicDto>>(profileResult.Error);

        var profile = profileResult.Value;

        var list = await _context.Academics
            .Where(a => a.ProfileId == profile.Id)
            .OrderByDescending(a => a.Period.Start)
            .ToListAsync(ct);

        return list.Select(a => a.ToDto()).ToList();
    }
}

