using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Showcase.Application.Features.Reports;

namespace Showcase.Api.Endpoints.Reports;

public record CreateReportRequest(
    string TargetType,
    string TargetId,
    string? TargetLabel,
    string Reason,
    string? Details);

public class CreateReport : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost("api/reports", async (
            CreateReportRequest request,
            ISender sender,
            CancellationToken ct) =>
        {
            var command = new CreateContentReportCommand(
                request.TargetType,
                request.TargetId,
                request.TargetLabel ?? request.TargetId,
                request.Reason,
                request.Details);

            var result = await sender.Send(command, ct);
            return result.ToResponse();
        })
        .WithTags("Reports")
        .WithName(nameof(CreateReport))
        .Produces<System.Guid>(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status400BadRequest)
        .ProducesProblem(StatusCodes.Status401Unauthorized)
        .RequireAuthorization();
    }
}
