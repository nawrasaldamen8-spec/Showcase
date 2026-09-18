using Showcase.Domain.Common.Results;

namespace Showcase.Domain.ValueObjects;

public sealed record StorageKey
{
    public const int MaxLength = 1000;

    public string Value { get; }

    private StorageKey() { Value = string.Empty; } // EF Core

    private StorageKey(string value) => Value = value;

    public static Result<StorageKey> Create(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
            return Error.Validation("StorageKey.Empty", "Storage key cannot be empty.");

        var trimmed = value.Trim();
        if (trimmed.Length > MaxLength)
            return Error.Validation("StorageKey.TooLong", $"Storage key cannot exceed {MaxLength} characters.");

        return new StorageKey(trimmed);
    }

    public static Result<StorageKey?> CreateOptional(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
            return Result.Success<StorageKey?>(null);

        var result = Create(value);
        return result.IsSuccess
            ? Result.Success<StorageKey?>(result.Value)
            : Result.Failure<StorageKey?>(result.Error);
    }

    public override string ToString() => Value;
}
