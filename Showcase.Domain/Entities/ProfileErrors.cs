using System;
using Showcase.Domain.Common.Results;

namespace Showcase.Domain.Entities;

public static class ProfileErrors
{
    public static readonly Error NotFound =
        Error.NotFound("Profile.NotFound", "The profile was not found.");

    public static Error NotFoundForUser(string userId) =>
        Error.NotFound("Profile.NotFoundForUser", $"Profile for user '{userId}' was not found.");

    public static Error NotFoundById(Guid id) =>
        Error.NotFound("Profile.NotFound", $"Profile with ID '{id}' was not found.");
}
