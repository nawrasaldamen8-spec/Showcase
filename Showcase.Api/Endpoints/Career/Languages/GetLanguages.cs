using System.Collections.Generic;
using System.Threading;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Showcase.Api.Common.Results;
using Showcase.Application.Features.Career.Common;
using Showcase.Application.Features.Career.Languages;

namespace Showcase.Api.Endpoints.Career.Languages;

public class GetLanguages : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("api/career/languages", async (
            ISender sender,
            CancellationToken ct) =>
        {
            var query = new GetLanguagesQuery();
            var result = await sender.Send(query, ct);
            return result.ToResponse();
        })
        .WithTags("Career - Languages")
        .WithName("GetCareerLanguages")
        .Produces<List<CareerLanguageDto>>(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status401Unauthorized)
        .RequireAuthorization();
    }
}
