using MediatR;
using Showcase.Domain.Common.Results;

namespace Showcase.Application.Features.Profiles.Commands.UpdateProfile;

public record UpdateProfileCommand(
    string Name,
    string? Specialty,
    string? Country,
    string? Bio) : IRequest<Result>;
