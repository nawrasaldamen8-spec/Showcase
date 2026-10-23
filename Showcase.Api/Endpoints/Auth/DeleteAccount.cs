using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using Showcase.Application.Features.Auth.Commands;

namespace Showcase.Api.Endpoints.Auth;

public class DeleteAccount : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapDelete("api/auth/account", async (
            [FromBody] DeleteAccountRequest request,
            ISender sender,
            CancellationToken ct) =>
        {
            var command = new DeleteAccountCommand(request.Password);
            var result = await sender.Send(command, ct);
            return result.ToResponse();
        })
        .WithTags("Auth")
        .WithName(nameof(DeleteAccount))
        .Produces(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status400BadRequest)
        .ProducesProblem(StatusCodes.Status401Unauthorized)
        .RequireAuthorization()
        .RequireRateLimiting("auth-policy");
    }
}

public record DeleteAccountRequest(string Password);
