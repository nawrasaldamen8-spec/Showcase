using System;
using Showcase.Domain.Common.Results;

namespace Showcase.Domain.Entities;

public static class PostErrors
{
    public static Error NotFound(Guid id) =>
        Error.NotFound("Post.NotFound", $"Post with ID '{id}' was not found.");

    public static readonly Error NotFoundGeneral =
        Error.NotFound("Post.NotFound", "The requested post was not found.");

    public static readonly Error CannotPublishEmptyPost =
        Error.Validation("Post.CannotPublishEmptyPost", "Cannot publish a post without at least one image.");

    public static readonly Error UnauthorizedAccess =
        Error.Forbidden("Post.UnauthorizedAccess", "You are not authorized to access or modify this post.");
}
