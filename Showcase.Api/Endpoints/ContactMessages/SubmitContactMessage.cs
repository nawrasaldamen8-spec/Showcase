using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Showcase.Api.Common.Results;
using Showcase.Application.Features.ContactMessages.Commands.SubmitContactMessage;
using System.Threading;

namespace Showcase.Api.Endpoints.ContactMessages;

public class SubmitContactMessage : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost("api/contact", async (SubmitContactMessageCommand command, ISender sender, CancellationToken ct) =>
        {
            var result = await sender.Send(command, ct);
            return result.ToResponse();
        })
        .WithTags("ContactMessages")
        .WithName(nameof(SubmitContactMessage))
        .RequireRateLimiting("ContactRatePolicy");
    }
}
