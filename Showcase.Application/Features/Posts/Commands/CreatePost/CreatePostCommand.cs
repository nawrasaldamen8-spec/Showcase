using System;
using System.Collections.Generic;
using MediatR;
using Showcase.Application.Features.Posts.Common;
using Showcase.Domain.Common.Results;

namespace Showcase.Application.Features.Posts.Commands.CreatePost;

public record CreatePostCommand(
    string Title,
    string Description = "",
    string? ExternalUrl = null,
    IReadOnlyList<string>? Tags = null) : IRequest<Result<PostCreatedResponse>>;
