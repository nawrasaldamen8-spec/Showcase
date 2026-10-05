namespace Showcase.Application.Features.Lookups.Queries;

public record TagDto(string Name, int UsageCount);

public record GetPopularTagsQuery(int Limit = 20) : IRequest<Result<IReadOnlyList<TagDto>>>, ICachableQuery
{
    public string CacheKey => $"lookups:tags:limit:{Limit}";
    public TimeSpan? Expiration => TimeSpan.FromHours(3);
}

public class GetPopularTagsQueryHandler(IApplicationDbContext context) : IRequestHandler<GetPopularTagsQuery, Result<IReadOnlyList<TagDto>>>
{
    private readonly IApplicationDbContext _context = context;

    public async Task<Result<IReadOnlyList<TagDto>>> Handle(GetPopularTagsQuery request, CancellationToken ct)
    {
        var tags = await _context.Tags
            .Select(t => new TagDto(t.Name, _context.PostTags.Count(pt => pt.TagId == t.Id)))
            .OrderByDescending(t => t.UsageCount)
            .Take(request.Limit)
            .ToListAsync(ct);

        return tags;
    }
}

