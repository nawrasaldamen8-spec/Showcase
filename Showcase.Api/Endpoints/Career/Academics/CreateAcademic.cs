using System.Threading;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Showcase.Api.Common.Results;
using Showcase.Application.Features.Career.Commands;
using Showcase.Application.Features.Career.Queries;
using Showcase.Application.Features.Career.Common;

namespace Showcase.Api.Endpoints.Career.Academics;

public class CreateAcademic : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost("api/career/academics", async (
            CreateAcademicCommand command,
            ISender sender,
            CancellationToken ct) =>
        {
            var result = await sender.Send(command, ct);
            return result.ToResponse();
        })
        .WithTags("Career - Academics")
        .WithName(nameof(CreateAcademic))
        .Produces<CareerAcademicDto>(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status400BadRequest)
        .ProducesProblem(StatusCodes.Status401Unauthorized)
        .RequireAuthorization();
    }
}

