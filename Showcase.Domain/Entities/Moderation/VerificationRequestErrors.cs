namespace Showcase.Domain.Entities;

public static class VerificationRequestErrors
{
    public static Error NotFound(Guid id) =>
        Error.NotFound("VerificationRequest.NotFound", $"Verification request with ID '{id}' was not found.");

    public static readonly Error AlreadyPending =
        Error.Conflict("VerificationRequest.AlreadyPending", "You already have a pending verification request.");

    public static readonly Error NotPending =
        Error.Validation("VerificationRequest.NotPending", "This request is not in a pending state.");
}
