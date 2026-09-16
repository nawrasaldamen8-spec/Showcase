using MediatR;
using Showcase.Application.Common.Interfaces;
using Showcase.Domain.Common.Results;
using Showcase.Domain.Entities.ContactMessage;
using System.Threading;
using System.Threading.Tasks;

namespace Showcase.Application.Features.ContactMessages.Commands.DeleteContactMessage;

public class DeleteContactMessageCommandHandler : IRequestHandler<DeleteContactMessageCommand, Result>
{
    private readonly IApplicationDbContext _context;
    public DeleteContactMessageCommandHandler(IApplicationDbContext context) => _context = context;

    public async Task<Result> Handle(DeleteContactMessageCommand request, CancellationToken ct)
    {
        var message = await _context.Set<ContactMessage>().FindAsync(new object[] { request.Id }, ct);
        if (message is null) return ContactMessageErrors.NotFound(request.Id);
        
        _context.Set<ContactMessage>().Remove(message);
        await _context.SaveChangesAsync(ct);
        return Result.Success();
    }
}
