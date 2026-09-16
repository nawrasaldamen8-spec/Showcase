using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Showcase.Api.Common.Results;
using Showcase.Application.Common.Models;
using Showcase.Application.Features.ContactMessages.Queries;
using Showcase.Application.Features.ContactMessages.Queries.GetContactMessages;
using System.Threading;

namespace Showcase.Api.Endpoints.ContactMessages;

public class GetContactMessages : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("api/admin/messages", async (
            int? pageNumber,
            int? pageSize,
            ISender sender,
            CancellationToken ct) =>
        {
            var query = new GetContactMessagesQuery(pageNumber ?? 1, pageSize ?? 10);
            var result = await sender.Send(query, ct);
            return result.ToResponse();
        })
        .WithTags("ContactMessages")
        .WithName(nameof(GetContactMessages))
        .Produces<PaginatedList<ContactMessageResponse>>(StatusCodes.Status200OK);
    }
}
