using System;
using MediatR;
using Showcase.Application.Features.Posts.Common;
using Showcase.Domain.Common.Results;

namespace Showcase.Application.Features.Posts.Commands.AddPostImage;

public record AddPostImageCommand(
    Guid PostId,
    string StorageKey,
    int? DisplayOrder = null) : IRequest<Result<PostImageDto>>;
