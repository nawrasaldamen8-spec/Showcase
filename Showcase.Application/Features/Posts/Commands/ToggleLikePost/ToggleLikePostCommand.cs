using System;
using MediatR;
using Showcase.Domain.Common.Results;

namespace Showcase.Application.Features.Posts.Commands.ToggleLikePost;

public record ToggleLikePostCommand(Guid PostId, bool? DesiredState = null) : IRequest<Result<ToggleLikePostResponse>>;
