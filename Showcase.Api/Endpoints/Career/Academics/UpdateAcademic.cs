using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Showcase.Application.Features.Career.Commands;
using Showcase.Application.Features.Career.Queries;
using Showcase.Application.Features.Career.Common;

namespace Showcase.Api.Endpoints.Career.Academics;

public record UpdateAcademicRequest(
    string Institution,
    string Degree,
    string FieldOfStudy,
    string StartDate,
    string? EndDate = null,
    bool CurrentlyStudying = false,
    string? Gpa = null,
    string? Achievements = null,
    string? Location = null,
    string? Description = null);

public class UpdateAcademic : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPut("api/career/academics/{id:guid}", async (
            Guid id,
            UpdateAcademicRequest request,
            ISender sender,
            CancellationToken ct) =>
        {
            var command = new UpdateAcademicCommand(
                id,
                request.Institution,
                request.Degree,
                request.FieldOfStudy,
                request.StartDate,
                request.EndDate,
                request.CurrentlyStudying,
                request.Gpa,
                request.Achievements,
                request.Location,
                request.Description);

            var result = await sender.Send(command, ct);
            return result.ToResponse();
        })
        .WithTags("Career - Academics")
        .WithName(nameof(UpdateAcademic))
        .Produces<CareerAcademicDto>(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status400BadRequest)
        .ProducesProblem(StatusCodes.Status401Unauthorized)
        .ProducesProblem(StatusCodes.Status404NotFound)
        .RequireAuthorization();
    }
}

