using MediatR;
using Showcase.Application.Common.Interfaces;
using Showcase.Domain.Common.Results;
using Showcase.Domain.Entities.ShowcaseItem;
using System.Threading;
using System.Threading.Tasks;

namespace Showcase.Application.Features.ShowcaseItems.Commands.DeleteShowcaseItem;

public class DeleteShowcaseItemCommandHandler : IRequestHandler<DeleteShowcaseItemCommand, Result>
{
    private readonly IApplicationDbContext _context;
    public DeleteShowcaseItemCommandHandler(IApplicationDbContext context) => _context = context;

    public async Task<Result> Handle(DeleteShowcaseItemCommand request, CancellationToken ct)
    {
        var item = await _context.Set<ShowcaseItem>().FindAsync(new object[] { request.Id }, ct);
        if (item is null) return ShowcaseItemErrors.NotFound(request.Id);
        
        _context.Set<ShowcaseItem>().Remove(item);
        await _context.SaveChangesAsync(ct);
        return Result.Success();
    }
}
