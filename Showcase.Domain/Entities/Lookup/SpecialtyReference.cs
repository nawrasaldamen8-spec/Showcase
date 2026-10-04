using System;

namespace Showcase.Domain.Entities;

public class SpecialtyReference
{
    public int Id { get; private set; }
    public string Code { get; private set; } = string.Empty;
    public string Name { get; private set; } = string.Empty;
    public string Category { get; private set; } = string.Empty;
    public string SubField { get; private set; } = string.Empty;

    private SpecialtyReference() { } // EF Core

    public SpecialtyReference(int id, string code, string name, string category, string subField)
    {
        if (id <= 0)
            throw new ArgumentOutOfRangeException(nameof(id), "Specialty ID must be positive.");

        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Specialty name is required.", nameof(name));

        Id = id;
        Code = code?.Trim() ?? string.Empty;
        Name = name.Trim();
        Category = string.IsNullOrWhiteSpace(category) ? "General" : category.Trim();
        SubField = subField?.Trim() ?? string.Empty;
    }
}
