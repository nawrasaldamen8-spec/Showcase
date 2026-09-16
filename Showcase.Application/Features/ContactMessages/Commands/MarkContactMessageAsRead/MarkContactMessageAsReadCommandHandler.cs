using MediatR;
using Showcase.Application.Common.Interfaces;
using Showcase.Domain.Common.Results;
using Showcase.Domain.Entities.ContactMessage;
using System.Threading;
using System.Threading.Tasks;

namespace Showcase.Application.Features.ContactMessages.Commands.MarkContactMessageAsRead;

public class MarkContactMessageAsReadCommandHandler : IRequestHandler<MarkContactMessageAsReadCommand, Result>
{
    private readonly IApplicationDbContext _context;
    public MarkContactMessageAsReadCommandHandler(IApplicationDbContext context) => _context = context;

    public async Task<Result> Handle(MarkContactMessageAsReadCommand request, CancellationToken ct)
    {
        var message = await _context.Set<ContactMessage>().FindAsync(new object[] { request.Id }, ct);
        if (message is null) return ContactMessageErrors.NotFound(request.Id);
        
        message.MarkAsRead();
        await _context.SaveChangesAsync(ct);
        return Result.Success();
    }
}
