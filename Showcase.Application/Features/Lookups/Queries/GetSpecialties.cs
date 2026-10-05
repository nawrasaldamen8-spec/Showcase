namespace Showcase.Application.Features.Lookups.Queries;

public record SpecialtyItemDto(int Id, string Code, string Name, string SubField);

public record SpecialtyCategoryDto(
    string Name,
    IReadOnlyList<SpecialtyItemDto> Specialties);

public record GetSpecialtiesQuery : IRequest<Result<IReadOnlyList<SpecialtyCategoryDto>>>, ICachableQuery
{
    public string CacheKey => "lookups:specialties";
    public TimeSpan? Expiration => TimeSpan.FromDays(30);
}

public class GetSpecialtiesQueryHandler(IApplicationDbContext context) : IRequestHandler<GetSpecialtiesQuery, Result<IReadOnlyList<SpecialtyCategoryDto>>>
{
    private readonly IApplicationDbContext _context = context;

    public async Task<Result<IReadOnlyList<SpecialtyCategoryDto>>> Handle(GetSpecialtiesQuery request, CancellationToken ct)
    {
        var rawSpecialties = await _context.SpecialtyReferences
            .OrderBy(s => s.Category)
            .ThenBy(s => s.Name)
            .ToListAsync(ct);

        var grouped = rawSpecialties
            .GroupBy(s => s.Category)
            .Select(g => new SpecialtyCategoryDto(
                g.Key,
                g.Select(s => new SpecialtyItemDto(s.Id, s.Code, s.Name, s.SubField)).ToList()))
            .ToList();

        return grouped;
    }
}

