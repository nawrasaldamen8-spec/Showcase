using Showcase.Domain.Common.Results;
using System;

namespace Showcase.Domain.Entities.ContactMessage;

public static class ContactMessageErrors
{
    public static Error NotFound(Guid id) => Error.NotFound("ContactMessage.NotFound", $"Contact message '{id}' was not found.");
}
