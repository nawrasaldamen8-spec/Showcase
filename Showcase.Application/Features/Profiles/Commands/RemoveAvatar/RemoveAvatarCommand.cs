using MediatR;
using Showcase.Domain.Common.Results;

namespace Showcase.Application.Features.Profiles.Commands.RemoveAvatar;

public record RemoveAvatarCommand : IRequest<Result>;
