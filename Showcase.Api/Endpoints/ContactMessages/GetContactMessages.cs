using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Showcase.Api.Common.Results;
using Showcase.Application.Features.ContactMessages.Queries.GetContactMessages;
using System.Threading;

namespace Showcase.Api.Endpoints.ContactMessages;

public class GetContactMessages : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("api/admin/messages", async (ISender sender, CancellationToken ct) =>
        {
            var result = await sender.Send(new GetContactMessagesQuery(), ct);
            return result.ToResponse();
        })
        .WithTags("ContactMessages")
        .WithName(nameof(GetContactMessages));
    }
}
