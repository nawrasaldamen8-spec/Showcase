namespace Showcase.Domain.Entities;

public static class ProfileErrors
{
    public static readonly Error NotFound =
        Error.NotFound("Profile.NotFound", "The profile was not found.");

    public static Error NotFoundForUser(string userId) =>
        Error.NotFound("Profile.NotFoundForUser", $"Profile for user '{userId}' was not found.");

    public static Error NotFoundById(Guid id) =>
        Error.NotFound("Profile.NotFound", $"Profile with ID '{id}' was not found.");

    public static Error VerificationNotRequestable(VerificationStatus current) =>
        Error.Conflict(
            "Profile.VerificationNotRequestable",
            $"Verification cannot be requested while the current status is '{current}'.");

    public static Error VerificationNotPending(VerificationStatus current) =>
        Error.Conflict(
            "Profile.VerificationNotPending",
            $"Verification can only be rejected while it is pending. The current status is '{current}'.");

    public static Error InvalidFeaturedTransition(FeaturedStatus from, FeaturedStatus to) =>
        Error.Conflict(
            "Profile.InvalidFeaturedTransition",
            $"Featured status cannot move from '{from}' to '{to}'.");
}
