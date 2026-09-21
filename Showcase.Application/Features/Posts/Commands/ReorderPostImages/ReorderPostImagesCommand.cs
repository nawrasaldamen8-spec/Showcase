using System;
using System.Collections.Generic;
using MediatR;
using Showcase.Domain.Common.Results;

namespace Showcase.Application.Features.Posts.Commands.ReorderPostImages;

public record ReorderPostImageItem(Guid Id, int DisplayOrder);

public record ReorderPostImagesCommand(
    Guid PostId,
    IReadOnlyList<ReorderPostImageItem> Items) : IRequest<Result>;
