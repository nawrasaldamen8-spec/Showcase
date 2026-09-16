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

        var imageRes = Url.CreateOptional(request.ImageUrl);
        if (imageRes.IsFailure) return imageRes.Error;

        var linkRes = Url.CreateOptional(request.LinkUrl);
        if (linkRes.IsFailure) return linkRes.Error;

        item.UpdateDetails(request.Title, request.Description, imageRes.Value, linkRes.Value);
        item.ChangeOrder(request.DisplayOrder);
        if (request.IsFeatured) item.SetFeatured(); else item.RemoveFeatured();

        await _context.SaveChangesAsync(ct);
        return Result.Success();
    }
}
