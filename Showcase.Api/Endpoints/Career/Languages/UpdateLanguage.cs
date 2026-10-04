using System;
using System.Threading;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Showcase.Api.Common.Results;
using Showcase.Application.Features.Career.Common;
using Showcase.Application.Features.Career.Commands;
using Showcase.Application.Features.Career.Queries;

namespace Showcase.Api.Endpoints.Career.Languages;

public record UpdateLanguageRequest(
    string Language,
    string Proficiency);

public class UpdateLanguage : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPut("api/career/languages/{id:guid}", async (
            Guid id,
            UpdateLanguageRequest request,
            ISender sender,
            CancellationToken ct) =>
        {
            var command = new UpdateLanguageCommand(id, request.Language, request.Proficiency);
            var result = await sender.Send(command, ct);
            return result.ToResponse();
        })
        .WithTags("Career - Languages")
        .WithName(nameof(UpdateLanguage))
        .Produces<CareerLanguageDto>(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status400BadRequest)
        .ProducesProblem(StatusCodes.Status401Unauthorized)
        .ProducesProblem(StatusCodes.Status404NotFound)
        .RequireAuthorization();
    }
}

