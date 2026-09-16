using MediatR;
using Showcase.Application.Common.Interfaces;
using Showcase.Domain.Common.Results;
using Showcase.Domain.Entities.ShowcaseItem;
using Showcase.Domain.ValueObjects;
using System.Threading;
using System.Threading.Tasks;

namespace Showcase.Application.Features.ShowcaseItems.Commands.UpdateShowcaseItem;

public class UpdateShowcaseItemCommandHandler : IRequestHandler<UpdateShowcaseItemCommand, Result>
{
    private readonly IApplicationDbContext _context;
    public UpdateShowcaseItemCommandHandler(IApplicationDbContext context) => _context = context;

    public async Task<Result> Handle(UpdateShowcaseItemCommand request, CancellationToken ct)
    {
        var item = await _context.Set<ShowcaseItem>().FindAsync(new object[] { request.Id }, ct);
        if (item is null) return ShowcaseItemErrors.NotFound(request.Id);

        Url? imageUrl = null, linkUrl = null;
        if (!string.IsNullOrWhiteSpace(request.ImageUrl))
        {
            var res = Url.Create(request.ImageUrl);
            if (res.IsFailure) return res.Error;
            imageUrl = res.Value;
        }

        if (!string.IsNullOrWhiteSpace(request.LinkUrl))
        {
            var res = Url.Create(request.LinkUrl);
            if (res.IsFailure) return res.Error;
            linkUrl = res.Value;
        }

        item.UpdateDetails(request.Title, request.Description, imageUrl, linkUrl);
        item.ChangeOrder(request.DisplayOrder);
        if (request.IsFeatured) item.SetFeatured(); else item.RemoveFeatured();

        await _context.SaveChangesAsync(ct);
        return Result.Success();
    }
}
