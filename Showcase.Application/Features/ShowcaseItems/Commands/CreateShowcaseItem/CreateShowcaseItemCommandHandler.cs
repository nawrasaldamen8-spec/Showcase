using MediatR;
using Showcase.Application.Common.Interfaces;
using Showcase.Domain.Common.Results;
using Showcase.Domain.Entities.ShowcaseItem;
using Showcase.Domain.ValueObjects;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Showcase.Application.Features.ShowcaseItems.Commands.CreateShowcaseItem;

public class CreateShowcaseItemCommandHandler : IRequestHandler<CreateShowcaseItemCommand, Result<Guid>>
{
    private readonly IApplicationDbContext _context;
    public CreateShowcaseItemCommandHandler(IApplicationDbContext context) => _context = context;

    public async Task<Result<Guid>> Handle(CreateShowcaseItemCommand request, CancellationToken ct)
    {
        var imageRes = Url.CreateOptional(request.ImageUrl);
        if (imageRes.IsFailure) return imageRes.Error;

        var linkRes = Url.CreateOptional(request.LinkUrl);
        if (linkRes.IsFailure) return linkRes.Error;

        var item = new ShowcaseItem(
            request.Title,
            request.Description,
            imageRes.Value,
            linkRes.Value,
            request.DisplayOrder,
            request.IsFeatured);

        _context.Set<ShowcaseItem>().Add(item);
        await _context.SaveChangesAsync(ct);

        return item.Id;
    }
}
