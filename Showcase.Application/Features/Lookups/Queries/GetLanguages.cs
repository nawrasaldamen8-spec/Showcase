using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Showcase.Application.Common.Interfaces;
using Showcase.Domain.Common.Results;

namespace Showcase.Application.Features.Lookups.Queries;

public record LanguageRefDto(string Code, string Name);

public record GetLanguagesQuery : IRequest<Result<IReadOnlyList<LanguageRefDto>>>, ICachableQuery
{
    public string CacheKey => "lookups:languages";
    public TimeSpan? Expiration => TimeSpan.FromDays(30);
}

public class GetLanguagesQueryHandler : IRequestHandler<GetLanguagesQuery, Result<IReadOnlyList<LanguageRefDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetLanguagesQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<IReadOnlyList<LanguageRefDto>>> Handle(GetLanguagesQuery request, CancellationToken ct)
    {
        var languages = await _context.LanguageReferences
            .OrderBy(l => l.Name)
            .Select(l => new LanguageRefDto(l.Code, l.Name))
            .ToListAsync(ct);

        return languages;
    }
}

