using System;

namespace Showcase.Domain.Entities;

public class Country
{
    public int Id { get; private set; }
    public string Alpha2 { get; private set; } = string.Empty;
    public string Alpha3 { get; private set; } = string.Empty;
    public string Name { get; private set; } = string.Empty;

    private Country() { } // EF Core

    public Country(int id, string alpha2, string alpha3, string name)
    {
        if (id <= 0)
            throw new ArgumentOutOfRangeException(nameof(id), "Country ID must be positive.");

        if (string.IsNullOrWhiteSpace(alpha2) || alpha2.Trim().Length != 2)
            throw new ArgumentException("Alpha2 code must be exactly 2 characters.", nameof(alpha2));

        if (string.IsNullOrWhiteSpace(alpha3) || alpha3.Trim().Length != 3)
            throw new ArgumentException("Alpha3 code must be exactly 3 characters.", nameof(alpha3));

        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Country name is required.", nameof(name));

        Id = id;
        Alpha2 = alpha2.Trim().ToLowerInvariant();
        Alpha3 = alpha3.Trim().ToLowerInvariant();
        Name = name.Trim();
    }
}
