using MediatR;
using Microsoft.EntityFrameworkCore;
using Showcase.Application.Common.Interfaces;
using Showcase.Domain.Common.Results;
using Showcase.Domain.Entities.ContactMessage;
using Showcase.Application.Features.ContactMessages.Queries;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Showcase.Application.Features.ContactMessages.Queries.GetContactMessageById;

public class GetContactMessageByIdQueryHandler : IRequestHandler<GetContactMessageByIdQuery, Result<ContactMessageResponse>>
{
    private readonly IApplicationDbContext _context;
    public GetContactMessageByIdQueryHandler(IApplicationDbContext context) => _context = context;

    public async Task<Result<ContactMessageResponse>> Handle(GetContactMessageByIdQuery request, CancellationToken ct)
    {
        var item = await _context.Set<ContactMessage>()
            .AsNoTracking()
            .Where(m => m.Id == request.Id)
            .Select(m => new ContactMessageResponse(
                m.Id, m.Name, m.EmailAddress.Value, m.Subject, m.Message, m.CreatedAt, m.IsRead))
            .FirstOrDefaultAsync(ct);

        if (item is null) return ContactMessageErrors.NotFound(request.Id);
        return item;
    }
}
