using Showcase.Domain.Common.Results;

namespace Showcase.Domain.ValueObjects;

public sealed record Bio
{
    public const int MaxLength = 500;

    public string Value { get; }

    private Bio() { Value = string.Empty; } // EF Core

    private Bio(string value) => Value = value;

    public static Result<Bio> Create(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
            return Error.Validation("Bio.Empty", "Bio cannot be empty.");

        var trimmed = value.Trim();
        if (trimmed.Length > MaxLength)
            return Error.Validation("Bio.TooLong", $"Bio cannot exceed {MaxLength} characters.");

        return new Bio(trimmed);
    }

    public static Result<Bio?> CreateOptional(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
            return Result.Success<Bio?>(null);

        var result = Create(value);
        return result.IsSuccess
            ? Result.Success<Bio?>(result.Value)
            : Result.Failure<Bio?>(result.Error);
    }

    public override string ToString() => Value;
}
