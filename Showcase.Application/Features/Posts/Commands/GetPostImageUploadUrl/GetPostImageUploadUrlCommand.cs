using System;
using MediatR;
using Showcase.Application.Features.Posts.Common;
using Showcase.Domain.Common.Results;

namespace Showcase.Application.Features.Posts.Commands.GetPostImageUploadUrl;

public record GetPostImageUploadUrlCommand(
    Guid PostId,
    string ContentType,
    long FileSizeBytes) : IRequest<Result<PostImageUploadUrlResponse>>;
