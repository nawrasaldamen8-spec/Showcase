using System;
using Showcase.Domain.Common.Results;

namespace Showcase.Domain.ValueObjects;

public sealed record Url
{
    public const int MaxLength = 2000;

    public string Value { get; }

    private Url() { Value = string.Empty; } // EF Core

    private Url(string value) => Value = value;

    public static Result<Url> Create(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
            return Error.Validation("Url.Empty", "URL cannot be empty.");

        var trimmed = value.Trim();
        if (trimmed.Length > MaxLength)
            return Error.Validation("Url.TooLong", $"URL cannot exceed {MaxLength} characters.");

        if (!Uri.TryCreate(trimmed, UriKind.Absolute, out var uriResult) ||
            (uriResult.Scheme != Uri.UriSchemeHttp && uriResult.Scheme != Uri.UriSchemeHttps))
        {
            return Error.Validation("Url.Invalid", "URL is invalid. It must be an absolute HTTP or HTTPS URL.");
        }

        return new Url(trimmed);
    }

    public static Result<Url?> CreateOptional(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
            return Result.Success<Url?>(null);

        var result = Create(value);
        return result.IsSuccess
            ? Result.Success<Url?>(result.Value)
            : Result.Failure<Url?>(result.Error);
    }

    public override string ToString() => Value;
}
