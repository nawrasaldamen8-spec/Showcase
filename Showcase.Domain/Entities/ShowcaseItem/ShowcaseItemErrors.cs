using Showcase.Domain.Common.Results;
using System;

namespace Showcase.Domain.Entities.ShowcaseItem;

public static class ShowcaseItemErrors
{
    public static Error NotFound(Guid id) => Error.NotFound("ShowcaseItem.NotFound", $"Showcase item '{id}' was not found.");
}
