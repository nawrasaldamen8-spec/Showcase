using MediatR;
using Showcase.Domain.Common.Results;

namespace Showcase.Application.Features.Profiles.Commands.UpdateProfile;

public record UpdateProfileCommand(
    string FirstName,
    string LastName,
    string? Bio) : IRequest<Result>;
