using System;
using MediatR;
using Showcase.Domain.Common.Results;

namespace Showcase.Application.Features.Posts.Commands.RemovePostImage;

public record RemovePostImageCommand(
    Guid PostId,
    Guid ImageId) : IRequest<Result>;
