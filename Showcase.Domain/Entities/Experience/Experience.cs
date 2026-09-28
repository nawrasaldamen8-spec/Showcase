using System;
using System.Collections.Generic;
using System.Linq;
using Showcase.Domain.Common.BaseEntity;
using Showcase.Domain.ValueObjects;

namespace Showcase.Domain.Entities;

public class Experience : BaseEntity
{
    public Guid ProfileId { get; private set; }
    public string JobTitle { get; private set; } = string.Empty;
    public string Company { get; private set; } = string.Empty;
    public DateRange Period { get; private set; } = null!;
    public string? Description { get; private set; }
    public string? Achievements { get; private set; }
    public string? EmploymentType { get; private set; }
    public string? Location { get; private set; }

    private readonly List<string> _skillsUsed = new();

    public IReadOnlyCollection<string> SkillsUsed => _skillsUsed.AsReadOnly();

    private Experience() { } // EF Core

    public Experience(
        Guid profileId,
        string jobTitle,
        string company,
        DateRange period,
        string? description = null,
        string? achievements = null,
        string? employmentType = null,
        string? location = null)
    {
        if (profileId == Guid.Empty)
            throw new ArgumentException("ProfileId is required.", nameof(profileId));

        Period = period ?? throw new ArgumentNullException(nameof(period));
        ProfileId = profileId;
        Update(jobTitle, company, period, description, achievements, employmentType, location);
    }

    public void Update(
        string jobTitle,
        string company,
        DateRange period,
        string? description,
        string? achievements,
        string? employmentType = null,
        string? location = null)
    {
        if (string.IsNullOrWhiteSpace(jobTitle))
            throw new ArgumentException("JobTitle is required.", nameof(jobTitle));

        if (string.IsNullOrWhiteSpace(company))
            throw new ArgumentException("Company is required.", nameof(company));

        JobTitle = jobTitle.Trim();
        Company = company.Trim();
        Period = period ?? throw new ArgumentNullException(nameof(period));
        Description = Normalize(description);
        Achievements = Normalize(achievements);
        EmploymentType = Normalize(employmentType);
        Location = Normalize(location);
    }

    public void SetSkillsUsed(IEnumerable<string> skillsUsed)
    {
        ArgumentNullException.ThrowIfNull(skillsUsed);

        _skillsUsed.Clear();
        _skillsUsed.AddRange(skillsUsed
            .Where(skill => !string.IsNullOrWhiteSpace(skill))
            .Select(skill => skill.Trim()));
    }

    private static string? Normalize(string? value) => string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}
