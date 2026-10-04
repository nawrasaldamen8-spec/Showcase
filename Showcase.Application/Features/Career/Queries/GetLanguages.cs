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

public record GetLanguagesQuery : IRequest<Result<IReadOnlyList<CareerLanguageDto>>>;

public class GetLanguagesQueryHandler : IRequestHandler<GetLanguagesQuery, Result<IReadOnlyList<CareerLanguageDto>>>
{
    private readonly ICurrentUserService _currentUserService;
    private readonly IApplicationDbContext _context;

    public GetLanguagesQueryHandler(
        ICurrentUserService currentUserService,
        IApplicationDbContext context)
    {
        _currentUserService = currentUserService;
        _context = context;
    }

    public async Task<Result<IReadOnlyList<CareerLanguageDto>>> Handle(GetLanguagesQuery request, CancellationToken ct)
    {
        var profileResult = await _context.GetActiveProfileByUserIdAsync(_currentUserService.UserId, ct);
        if (profileResult.IsFailure)
            return Result.Failure<IReadOnlyList<CareerLanguageDto>>(profileResult.Error);

        var profile = profileResult.Value;

        var list = await _context.Languages
            .Where(l => l.ProfileId == profile.Id)
            .OrderBy(l => l.LanguageName)
            .ToListAsync(ct);

        return list.Select(l => l.ToDto()).ToList();
    }
}

