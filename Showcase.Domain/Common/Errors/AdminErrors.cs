namespace Showcase.Domain.Common.Errors;

public static class AdminErrors
{
    public static readonly Error PasswordRequired = Error.Validation(
        "Admin.PasswordRequired", "Admin password confirmation is required to modify administrative privileges.");

    public static readonly Error InvalidPassword = Error.Validation(
        "Admin.InvalidPassword", "The administrator password provided is incorrect.");
}
