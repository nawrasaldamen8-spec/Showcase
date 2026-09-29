using System;
using System.Threading;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Showcase.Api.Common.Results;
using Showcase.Application.Features.Admin.Verifications;

namespace Showcase.Api.Endpoints.Admin.Verifications;

public record AdminDecisionRequest(string? Note = null);

public class ApproveVerificationRequest : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost("api/admin/verifications/{requestId:guid}/approve", async (
            Guid requestId,
            AdminDecisionRequest? request,
            ISender sender,
            CancellationToken ct) =>
        {
            var command = new ApproveVerificationRequestCommand(requestId, request?.Note);
            var result = await sender.Send(command, ct);
            return result.ToResponse();
        })
        .WithTags("Admin - Verifications")
        .WithName(nameof(ApproveVerificationRequest))
        .Produces(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status400BadRequest)
        .ProducesProblem(StatusCodes.Status401Unauthorized)
        .ProducesProblem(StatusCodes.Status403Forbidden)
        .ProducesProblem(StatusCodes.Status404NotFound)
        .RequireAuthorization(policy => policy.RequireRole("Admin"));
    }
}
