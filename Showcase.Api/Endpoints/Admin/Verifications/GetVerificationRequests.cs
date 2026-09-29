using System.Collections.Generic;
using System.Threading;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Showcase.Api.Common.Results;
using Showcase.Application.Features.Admin.Common;
using Showcase.Application.Features.Admin.Verifications;

namespace Showcase.Api.Endpoints.Admin.Verifications;

public class GetVerificationRequests : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("api/admin/verifications", async (
            ISender sender,
            CancellationToken ct) =>
        {
            var query = new GetVerificationRequestsQuery();
            var result = await sender.Send(query, ct);
            return result.ToResponse();
        })
        .WithTags("Admin - Verifications")
        .WithName(nameof(GetVerificationRequests))
        .Produces<IReadOnlyList<VerificationRequestItemDto>>(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status401Unauthorized)
        .ProducesProblem(StatusCodes.Status403Forbidden)
        .RequireAuthorization(policy => policy.RequireRole("Admin"));
    }
}
