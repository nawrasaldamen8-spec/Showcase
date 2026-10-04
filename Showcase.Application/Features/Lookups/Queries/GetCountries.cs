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

public record CountryDto(int Id, string Alpha2, string Alpha3, string Name);

public record GetCountriesQuery : IRequest<Result<IReadOnlyList<CountryDto>>>, ICachableQuery
{
    public string CacheKey => "lookups:countries";
    public TimeSpan? Expiration => TimeSpan.FromDays(30);
}

public class GetCountriesQueryHandler : IRequestHandler<GetCountriesQuery, Result<IReadOnlyList<CountryDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetCountriesQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<IReadOnlyList<CountryDto>>> Handle(GetCountriesQuery request, CancellationToken ct)
    {
        var countries = await _context.Countries
            .OrderBy(c => c.Name)
            .Select(c => new CountryDto(c.Id, c.Alpha2, c.Alpha3, c.Name))
            .ToListAsync(ct);

        return countries;
    }
}

