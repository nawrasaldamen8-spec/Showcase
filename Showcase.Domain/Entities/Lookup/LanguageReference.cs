namespace Showcase.Domain.Entities;

public class LanguageReference
{
    public string Code { get; private set; } = string.Empty;
    public string Name { get; private set; } = string.Empty;

    private LanguageReference() { } // EF Core

    public LanguageReference(string code, string name)
    {
        if (string.IsNullOrWhiteSpace(code))
            throw new ArgumentException("Language code is required.", nameof(code));

        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Language name is required.", nameof(name));

        Code = code.Trim().ToLowerInvariant();
        Name = name.Trim();
    }
}
