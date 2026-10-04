using System;
using System.Threading;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Showcase.Api.Common.Results;
using Showcase.Application.Features.Career.Commands;
using Showcase.Application.Features.Career.Queries;

namespace Showcase.Api.Endpoints.Career.Academics;

public class DeleteAcademic : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapDelete("api/career/academics/{id:guid}", async (
            Guid id,
            ISender sender,
            CancellationToken ct) =>
        {
            var command = new DeleteAcademicCommand(id);
            var result = await sender.Send(command, ct);
            return result.ToResponse();
        })
        .WithTags("Career - Academics")
        .WithName(nameof(DeleteAcademic))
        .Produces(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status401Unauthorized)
        .ProducesProblem(StatusCodes.Status404NotFound)
        .RequireAuthorization();
    }
}

