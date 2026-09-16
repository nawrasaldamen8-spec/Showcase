using Showcase.Domain.Common.Results;
using System;

namespace Showcase.Domain.Entities.Profile;

public static class ProfileErrors
{
    public static readonly Error NotFound = Error.NotFound("Profile.NotFound", "The profile was not found.");
}
