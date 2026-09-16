using Showcase.Domain.Common.Results;
using System;

namespace Showcase.Domain.ValueObjects;

public record Url
{
    public string Value { get; }
    private Url(string value) => Value = value;

    public static Result<Url> Create(string value)
    {
        if (string.IsNullOrWhiteSpace(value) || !Uri.TryCreate(value, UriKind.Absolute, out _))
            return Error.Validation("Url.Invalid", "URL is invalid.");
        return new Url(value);
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
}
