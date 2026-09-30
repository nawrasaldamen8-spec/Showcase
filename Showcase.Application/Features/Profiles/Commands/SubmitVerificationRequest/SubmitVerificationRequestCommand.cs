using MediatR;
using Showcase.Domain.Common.Results;

namespace Showcase.Application.Features.Profiles.Commands.SubmitVerificationRequest;

public record SubmitVerificationRequestCommand(
    string? Message = null,
    string? Notes = null,
    string? Category = null,
    string? IdentificationNumber = null,
    string? WebsiteUrl = null,
    string? PortfolioUrl = null,
    string? DocumentUrl = null) : IRequest<Result>;

