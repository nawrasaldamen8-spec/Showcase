namespace Showcase.Domain.Entities;

public class Academic : BaseEntity
{
    public Guid ProfileId { get; private set; }
    public string Institution { get; private set; } = string.Empty;
    public string Degree { get; private set; } = string.Empty;
    public string FieldOfStudy { get; private set; } = string.Empty;
    public DateRange Period { get; private set; } = null!;
    public string? Gpa { get; private set; }
    public string? Achievements { get; private set; }
    public string? Location { get; private set; }
    public string? Description { get; private set; }
    public DateTime CreatedAtUtc { get; private set; } = DateTime.UtcNow;

    private Academic() { } // EF Core

    public Academic(
        Guid profileId,
        string institution,
        string degree,
        string fieldOfStudy,
        DateRange period,
        string? gpa = null,
        string? achievements = null,
        string? location = null,
        string? description = null)
    {
        if (profileId == Guid.Empty)
            throw new ArgumentException("ProfileId is required.", nameof(profileId));

        Period = period ?? throw new ArgumentNullException(nameof(period));
        ProfileId = profileId;
        Update(institution, degree, fieldOfStudy, period, gpa, achievements, location, description);
    }

    public void Update(
        string institution,
        string degree,
        string fieldOfStudy,
        DateRange period,
        string? gpa,
        string? achievements,
        string? location = null,
        string? description = null)
    {
        if (string.IsNullOrWhiteSpace(institution))
            throw new ArgumentException("Institution is required.", nameof(institution));

        if (string.IsNullOrWhiteSpace(degree))
            throw new ArgumentException("Degree is required.", nameof(degree));

        if (string.IsNullOrWhiteSpace(fieldOfStudy))
            throw new ArgumentException("FieldOfStudy is required.", nameof(fieldOfStudy));

        Institution = institution.Trim();
        Degree = degree.Trim();
        FieldOfStudy = fieldOfStudy.Trim();
        Period = period ?? throw new ArgumentNullException(nameof(period));
        Gpa = Normalize(gpa);
        Achievements = Normalize(achievements);
        Location = Normalize(location);
        Description = Normalize(description);
    }

    private static string? Normalize(string? value) => string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}
