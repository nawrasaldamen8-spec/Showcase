using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Showcase.Application.Common.Interfaces;
using Showcase.Domain.Common.Results;

namespace Showcase.Application.Features.Lookups;

public record TagDto(string Name, int UsageCount);

public record GetPopularTagsQuery(int Limit = 20) : IRequest<Result<IReadOnlyList<TagDto>>>;

public class GetPopularTagsQueryHandler : IRequestHandler<GetPopularTagsQuery, Result<IReadOnlyList<TagDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetPopularTagsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<IReadOnlyList<TagDto>>> Handle(GetPopularTagsQuery request, CancellationToken ct)
    {
        var tags = await _context.Tags
            .AsNoTracking()
            .Select(t => new TagDto(t.Name, _context.PostTags.Count(pt => pt.TagId == t.Id)))
            .OrderByDescending(t => t.UsageCount)
            .Take(request.Limit)
            .ToListAsync(ct);

        return tags;
    }
}
