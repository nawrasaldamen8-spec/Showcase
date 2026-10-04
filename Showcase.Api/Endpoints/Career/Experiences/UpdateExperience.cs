using System;
using System.Collections.Generic;
using System.Threading;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Showcase.Api.Common.Results;
using Showcase.Application.Features.Career.Common;
using Showcase.Application.Features.Career.Commands;
using Showcase.Application.Features.Career.Queries;

namespace Showcase.Api.Endpoints.Career.Experiences;

public record UpdateExperienceRequest(
    string JobTitle,
    string Company,
    string StartDate,
    string? EndDate = null,
    bool CurrentlyWorking = false,
    string? Description = null,
    string? Achievements = null,
    string? EmploymentType = null,
    string? Location = null,
    IReadOnlyList<string>? SkillsUsed = null);

public class UpdateExperience : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPut("api/career/experiences/{id:guid}", async (
            Guid id,
            UpdateExperienceRequest request,
            ISender sender,
            CancellationToken ct) =>
        {
            var command = new UpdateExperienceCommand(
                id,
                request.JobTitle,
                request.Company,
                request.StartDate,
                request.EndDate,
                request.CurrentlyWorking,
                request.Description,
                request.Achievements,
                request.EmploymentType,
                request.Location,
                request.SkillsUsed);

            var result = await sender.Send(command, ct);
            return result.ToResponse();
        })
        .WithTags("Career - Experiences")
        .WithName(nameof(UpdateExperience))
        .Produces<CareerExperienceDto>(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status400BadRequest)
        .ProducesProblem(StatusCodes.Status401Unauthorized)
        .ProducesProblem(StatusCodes.Status404NotFound)
        .RequireAuthorization();
    }
}

