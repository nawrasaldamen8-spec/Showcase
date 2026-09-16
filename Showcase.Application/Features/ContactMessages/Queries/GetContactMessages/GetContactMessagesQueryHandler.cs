using MediatR;
using Microsoft.EntityFrameworkCore;
using Showcase.Application.Common.Interfaces;
using Showcase.Domain.Common.Results;
using Showcase.Application.Features.ContactMessages.Queries;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Showcase.Application.Features.ContactMessages.Queries.GetContactMessages;

public class GetContactMessagesQueryHandler : IRequestHandler<GetContactMessagesQuery, Result<List<ContactMessageResponse>>>
{
    private readonly IApplicationDbContext _context;
    public GetContactMessagesQueryHandler(IApplicationDbContext context) => _context = context;

    public async Task<Result<List<ContactMessageResponse>>> Handle(GetContactMessagesQuery request, CancellationToken ct)
    {
        var items = await _context.Set<Showcase.Domain.Entities.ContactMessage.ContactMessage>()
            .AsNoTracking()
            .OrderByDescending(m => m.CreatedAt)
            .Select(m => new ContactMessageResponse(
                m.Id, m.Name, m.EmailAddress.Value, m.Subject, m.Message, m.CreatedAt, m.IsRead))
            .ToListAsync(ct);

        return items;
    }
}
