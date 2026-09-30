using System;
using System.Collections.Generic;
using MediatR;
using Showcase.Domain.Common.Results;

namespace Showcase.Application.Features.Posts.Commands.UpdatePost;

public record UpdatePostCommand(
    Guid Id,
    string Title,
    string Description = "",
    string? ExternalUrl = null,
    IReadOnlyList<string>? Tags = null) : IRequest<Result>;
