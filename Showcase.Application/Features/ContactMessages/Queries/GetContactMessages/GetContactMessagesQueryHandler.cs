using MediatR;
using Microsoft.EntityFrameworkCore;
using Showcase.Application.Common.Interfaces;
using Showcase.Application.Common.Models;
using Showcase.Application.Features.ContactMessages.Queries;
using Showcase.Domain.Common.Results;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Showcase.Application.Features.ContactMessages.Queries.GetContactMessages;

public class GetContactMessagesQueryHandler : IRequestHandler<GetContactMessagesQuery, Result<PaginatedList<ContactMessageResponse>>>
{
    private readonly IApplicationDbContext _context;
    public GetContactMessagesQueryHandler(IApplicationDbContext context) => _context = context;

    public async Task<Result<PaginatedList<ContactMessageResponse>>> Handle(GetContactMessagesQuery request, CancellationToken ct)
    {
        var query = _context.Set<Showcase.Domain.Entities.ContactMessage.ContactMessage>().AsNoTracking();

        var totalCount = await query.CountAsync(ct);

        var items = await query
            .OrderByDescending(m => m.CreatedAt)
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(m => new ContactMessageResponse(
                m.Id, m.Name, m.EmailAddress.Value, m.Subject, m.Message, m.CreatedAt, m.IsRead))
            .ToListAsync(ct);

        return PaginatedList<ContactMessageResponse>.Create(items, totalCount, request.PageNumber, request.PageSize);
    }
}
