using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Showcase.Api.Common.Results;
using Showcase.Application.Features.ContactMessages.Queries.GetContactMessageById;
using System;
using System.Threading;

namespace Showcase.Api.Endpoints.ContactMessages;

public class GetContactMessageById : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("api/admin/messages/{id:guid}", async (Guid id, ISender sender, CancellationToken ct) =>
        {
            var result = await sender.Send(new GetContactMessageByIdQuery(id), ct);
            return result.ToResponse();
        })
        .WithTags("ContactMessages")
        .WithName(nameof(GetContactMessageById));
    }
}
