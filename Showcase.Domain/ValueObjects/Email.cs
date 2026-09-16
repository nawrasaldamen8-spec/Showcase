using Showcase.Domain.Common.Results;
using System;

namespace Showcase.Domain.ValueObjects;

public record Email
{
    public string Value { get; }
    private Email(string value) => Value = value;
    
    public static Result<Email> Create(string value)
    {
        if (string.IsNullOrWhiteSpace(value) || !value.Contains('@'))
            return Error.Validation("Email.Invalid", "Email is invalid.");
        return new Email(value);
    }
}
