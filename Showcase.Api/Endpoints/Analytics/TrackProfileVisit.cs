using System;
using System.Security.Cryptography;
using System.Text;
using System.Threading;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Showcase.Api.Common.Results;
using Showcase.Application.Features.Analytics;

namespace Showcase.Api.Endpoints.Analytics;

public record TrackVisitRequest(Guid ProfileId, string? VisitorToken = null);

public class TrackProfileVisit : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost("api/analytics/visit", async (
            TrackVisitRequest request,
            HttpContext httpContext,
            ISender sender,
            CancellationToken ct) =>
        {
            var ip = httpContext.Connection.RemoteIpAddress?.ToString() ?? "127.0.0.1";
            var hashedIp = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(ip)));
            var command = new TrackProfileVisitCommand(request.ProfileId, hashedIp, request.VisitorToken);

            var result = await sender.Send(command, ct);
            return result.ToResponse();
        })
        .WithTags("Analytics")
        .WithName(nameof(TrackProfileVisit))
        .Produces(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status400BadRequest)
        .AllowAnonymous();
    }
}
