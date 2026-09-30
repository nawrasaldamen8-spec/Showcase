using MediatR;
using Showcase.Domain.Common.Results;

namespace Showcase.Application.Features.Profiles.Commands.SubmitFeaturedRequest;

public record SubmitFeaturedRequestCommand(string? Message = null, string? Notes = null) : IRequest<Result>;
