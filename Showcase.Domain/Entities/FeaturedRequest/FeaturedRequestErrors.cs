using System;
using Showcase.Domain.Common.Results;

namespace Showcase.Domain.Entities;

public static class FeaturedRequestErrors
{
    public static Error NotFound(Guid id) =>
        Error.NotFound("FeaturedRequest.NotFound", $"Featured request with ID '{id}' was not found.");

    public static readonly Error AlreadyPending =
        Error.Conflict("FeaturedRequest.AlreadyPending", "You already have a pending featured request.");

    public static readonly Error NotPending =
        Error.Validation("FeaturedRequest.NotPending", "This request is not in a pending state.");
}
