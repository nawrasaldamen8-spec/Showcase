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

namespace Showcase.Api.Endpoints.Career.Credentials;

public record UpdateCredentialRequest(
    string Name,
    string IssuingOrganization,
    string IssueDate,
    string? ExpiryDate = null,
    bool DoesNotExpire = false,
    string? CredentialId = null,
    string? VerificationUrl = null,
    string? MediaUrl = null);

public class UpdateCredential : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPut("api/career/credentials/{id:guid}", async (
            Guid id,
            UpdateCredentialRequest request,
            ISender sender,
            CancellationToken ct) =>
        {
            var command = new UpdateCredentialCommand(
                id,
                request.Name,
                request.IssuingOrganization,
                request.IssueDate,
                request.ExpiryDate,
                request.DoesNotExpire,
                request.CredentialId,
                request.VerificationUrl,
                request.MediaUrl);

            var result = await sender.Send(command, ct);
            return result.ToResponse();
        })
        .WithTags("Career - Credentials")
        .WithName(nameof(UpdateCredential))
        .Produces<CareerCredentialDto>(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status400BadRequest)
        .ProducesProblem(StatusCodes.Status401Unauthorized)
        .ProducesProblem(StatusCodes.Status404NotFound)
        .RequireAuthorization();
    }
}

