using System;
using MediatR;
using Showcase.Domain.Common.Results;

namespace Showcase.Application.Features.Posts.Commands.ToggleLikePost;

public record ToggleLikePostCommand(Guid PostId) : IRequest<Result<ToggleLikePostResponse>>;
