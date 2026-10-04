using System;
using Showcase.Domain.Common.Results;

namespace Showcase.Domain.Entities;

public static class PostImageErrors
{
    public static Error NotFound(Guid id) =>
        Error.NotFound("PostImage.NotFound", $"Post image with ID '{id}' was not found.");

    public static readonly Error NotFoundGeneral =
        Error.NotFound("PostImage.NotFound", "The requested post image was not found.");
}
