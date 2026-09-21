using MediatR;
using Showcase.Domain.Common.Results;

namespace Showcase.Application.Features.Profiles.Commands.UpdateAvatar;

public record UpdateAvatarCommand(string StorageKey) : IRequest<Result>;
