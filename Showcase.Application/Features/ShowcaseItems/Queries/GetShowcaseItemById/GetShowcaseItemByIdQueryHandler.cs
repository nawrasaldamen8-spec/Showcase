using MediatR;
using Microsoft.EntityFrameworkCore;
using Showcase.Application.Common.Interfaces;
using Showcase.Domain.Common.Results;
using Showcase.Domain.Entities.ShowcaseItem;
using Showcase.Application.Features.ShowcaseItems.Queries;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Showcase.Application.Features.ShowcaseItems.Queries.GetShowcaseItemById;

public class GetShowcaseItemByIdQueryHandler : IRequestHandler<GetShowcaseItemByIdQuery, Result<ShowcaseItemResponse>>
{
    private readonly IApplicationDbContext _context;
    public GetShowcaseItemByIdQueryHandler(IApplicationDbContext context) => _context = context;

    public async Task<Result<ShowcaseItemResponse>> Handle(GetShowcaseItemByIdQuery request, CancellationToken ct)
    {
        var item = await _context.Set<ShowcaseItem>()
            .AsNoTracking()
            .Where(i => i.Id == request.Id)
            .Select(i => new ShowcaseItemResponse(
                i.Id, i.Title, i.Description, 
                i.ImageUrl != null ? i.ImageUrl.Value : null,
                i.LinkUrl != null ? i.LinkUrl.Value : null,
                i.DisplayOrder, i.IsFeatured))
            .FirstOrDefaultAsync(ct);

        if (item is null) return ShowcaseItemErrors.NotFound(request.Id);
        return item;
    }
}
