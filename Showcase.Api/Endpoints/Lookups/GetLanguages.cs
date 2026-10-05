using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Showcase.Application.Features.Lookups.Queries;

namespace Showcase.Api.Endpoints.Lookups;

public class GetLanguages : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("api/lookups/languages", async (
            ISender sender,
            CancellationToken ct) =>
        {
            var query = new GetLanguagesQuery();
            var result = await sender.Send(query, ct);
            return result.ToResponse();
        })
        .WithTags("Lookups")
        .WithName("GetLookupLanguages")
        .Produces<IReadOnlyList<LanguageRefDto>>(StatusCodes.Status200OK)
        .AllowAnonymous();
    }
}
