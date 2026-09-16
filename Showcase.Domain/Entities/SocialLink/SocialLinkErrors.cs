using Showcase.Domain.Common.Results;
using System;

namespace Showcase.Domain.Entities.SocialLink;

public static class SocialLinkErrors
{
    public static Error NotFound(Guid id) => Error.NotFound("SocialLink.NotFound", $"Social link '{id}' was not found.");
}
