using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Showcase.Application.Features.Admin.Verifications;

namespace Showcase.Api.Endpoints.Admin.Verifications;

public class RejectVerificationRequest : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost("api/admin/verifications/{requestId:guid}/reject", async (
            Guid requestId,
            AdminDecisionRequest? request,
            ISender sender,
            CancellationToken ct) =>
        {
            var command = new RejectVerificationRequestCommand(requestId, request?.Note);
            var result = await sender.Send(command, ct);
            return result.ToResponse();
        })
        .WithTags("Admin - Verifications")
        .WithName(nameof(RejectVerificationRequest))
        .Produces(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status400BadRequest)
        .ProducesProblem(StatusCodes.Status401Unauthorized)
        .ProducesProblem(StatusCodes.Status403Forbidden)
        .ProducesProblem(StatusCodes.Status404NotFound)
        .RequireAuthorization(policy => policy.RequireRole("Admin"));
    }
}
