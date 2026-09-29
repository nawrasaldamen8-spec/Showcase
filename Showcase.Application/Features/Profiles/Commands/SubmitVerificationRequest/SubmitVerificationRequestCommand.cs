using MediatR;
using Showcase.Domain.Common.Results;

namespace Showcase.Application.Features.Profiles.Commands.SubmitVerificationRequest;

public record SubmitVerificationRequestCommand(string? Note = null) : IRequest<Result>;
