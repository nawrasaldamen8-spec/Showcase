using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Showcase.Api.Common.Results;
using Showcase.Application.Features.ContactMessages.Commands.MarkContactMessageAsRead;
using System;
using System.Threading;

namespace Showcase.Api.Endpoints.ContactMessages;

public class MarkMessageAsRead : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPut("api/admin/messages/{id:guid}/read", async (Guid id, ISender sender, CancellationToken ct) =>
        {
            var result = await sender.Send(new MarkContactMessageAsReadCommand(id), ct);
            return result.ToResponse();
        })
        .WithTags("ContactMessages")
        .WithName(nameof(MarkMessageAsRead));
    }
}
