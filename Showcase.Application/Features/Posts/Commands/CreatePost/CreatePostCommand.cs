using System;
using MediatR;
using Showcase.Domain.Common.Results;

namespace Showcase.Application.Features.Posts.Commands.CreatePost;

public record CreatePostCommand(
    string Title,
    string Description = "",
    string? ExternalUrl = null) : IRequest<Result<Guid>>;
