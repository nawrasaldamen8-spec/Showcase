using System;
using System.Threading;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Showcase.Api.Common.Results;
using Showcase.Application.Features.Admin.Featured;

namespace Showcase.Api.Endpoints.Admin.Featured;

public class RejectFeaturedRequest : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost("api/admin/featured/{id:guid}/reject", async (
            Guid id,
            FeaturedDecisionRequest? request,
            ISender sender,
            CancellationToken ct) =>
        {
            var command = new RejectFeaturedRequestCommand(id, request?.Note);
            var result = await sender.Send(command, ct);
            return result.ToResponse();
        })
        .WithTags("Admin - Featured")
        .WithName(nameof(RejectFeaturedRequest))
        .Produces(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status400BadRequest)
        .ProducesProblem(StatusCodes.Status401Unauthorized)
        .ProducesProblem(StatusCodes.Status403Forbidden)
        .ProducesProblem(StatusCodes.Status404NotFound)
        .RequireAuthorization(policy => policy.RequireRole("Admin"));
    }
}
