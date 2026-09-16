using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Showcase.Api.Common.Results;
using Showcase.Application.Features.ContactMessages.Commands.DeleteContactMessage;
using System;
using System.Threading;

namespace Showcase.Api.Endpoints.ContactMessages;

public class DeleteContactMessage : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapDelete("api/admin/messages/{id:guid}", async (Guid id, ISender sender, CancellationToken ct) =>
        {
            var result = await sender.Send(new DeleteContactMessageCommand(id), ct);
            return result.ToResponse();
        })
        .WithTags("ContactMessages")
        .WithName(nameof(DeleteContactMessage));
    }
}
