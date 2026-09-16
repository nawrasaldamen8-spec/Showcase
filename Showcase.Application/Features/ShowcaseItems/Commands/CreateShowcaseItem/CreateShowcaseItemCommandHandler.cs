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

        var item = new ShowcaseItem(request.Title, request.Description, imageUrl, linkUrl, request.DisplayOrder, request.IsFeatured);
        _context.Set<ShowcaseItem>().Add(item);
        await _context.SaveChangesAsync(ct);
        
        return item.Id;
    }
}
