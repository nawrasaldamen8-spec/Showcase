using System;
using System.Threading;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Showcase.Api.Common.Results;
using Showcase.Application.Features.Admin.Featured;

namespace Showcase.Api.Endpoints.Admin.Featured;

public record ToggleCuratedPinRequest(bool IsPinned);

public class ToggleCuratedPin : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPut("api/admin/featured/{id:guid}/pin", async (
            Guid id,
            ToggleCuratedPinRequest request,
            ISender sender,
            CancellationToken ct) =>
        {
            var command = new ToggleCuratedPinCommand(id, request.IsPinned);
            var result = await sender.Send(command, ct);
            return result.ToResponse();
        })
        .WithTags("Admin - Featured")
        .WithName(nameof(ToggleCuratedPin))
        .Produces(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status400BadRequest)
        .ProducesProblem(StatusCodes.Status401Unauthorized)
        .ProducesProblem(StatusCodes.Status403Forbidden)
        .ProducesProblem(StatusCodes.Status404NotFound)
        .RequireAuthorization(policy => policy.RequireRole("Admin"));
    }
}
