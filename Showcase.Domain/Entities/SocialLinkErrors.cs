using System;
using Showcase.Domain.Common.Results;

namespace Showcase.Domain.Entities;

public static class SocialLinkErrors
{
    public static Error NotFound(Guid id) =>
        Error.NotFound("SocialLink.NotFound", $"Social link with ID '{id}' was not found.");

    public static readonly Error NotFoundGeneral =
        Error.NotFound("SocialLink.NotFound", "The requested social link was not found.");

    public static readonly Error InvalidUrl =
        Error.Validation("SocialLink.InvalidUrl", "The social link URL is invalid.");
}
