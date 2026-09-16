using MediatR;
using Microsoft.EntityFrameworkCore;
using Showcase.Application.Common.Interfaces;
using Showcase.Domain.Common.Results;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Showcase.Application.Features.ShowcaseItems.Queries.GetShowcaseItems;

public class GetShowcaseItemsQueryHandler : IRequestHandler<GetShowcaseItemsQuery, Result<List<ShowcaseItemResponse>>>
{
    private readonly IApplicationDbContext _context;
    public GetShowcaseItemsQueryHandler(IApplicationDbContext context) => _context = context;

    public async Task<Result<List<ShowcaseItemResponse>>> Handle(GetShowcaseItemsQuery request, CancellationToken ct)
    {
        var items = await _context.Set<Showcase.Domain.Entities.ShowcaseItem.ShowcaseItem>()
            .AsNoTracking()
            .OrderBy(i => i.DisplayOrder)
            .Select(i => new ShowcaseItemResponse(
                i.Id, i.Title, i.Description, 
                i.ImageUrl != null ? i.ImageUrl.Value : null,
                i.LinkUrl != null ? i.LinkUrl.Value : null,
                i.DisplayOrder, i.IsFeatured))
            .ToListAsync(ct);

        return items;
    }
}
