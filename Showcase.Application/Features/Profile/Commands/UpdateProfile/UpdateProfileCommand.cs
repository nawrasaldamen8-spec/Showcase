using MediatR;
using Showcase.Domain.Common.Results;
namespace Showcase.Application.Features.Profile.Commands.UpdateProfile;

public record UpdateProfileCommand(string Name, string Title, string Bio, string? ProfileImageUrl, string Location) : IRequest<Result>;
