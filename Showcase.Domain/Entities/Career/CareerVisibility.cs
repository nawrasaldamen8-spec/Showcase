using System;
using Showcase.Domain.Common.BaseEntity;

namespace Showcase.Domain.Entities;

/// <summary>Per-section visibility switches for the public profile. Defaults to visible everywhere.</summary>
public class CareerVisibility : BaseEntity
{
    public Guid ProfileId { get; private set; }
    public bool Experience { get; private set; } = true;
    public bool Academics { get; private set; } = true;
    public bool Skills { get; private set; } = true;
    public bool Credentials { get; private set; } = true;
    public bool Languages { get; private set; } = true;
    public bool Achievements { get; private set; } = true;

    private CareerVisibility() { } // EF Core

    public CareerVisibility(Guid profileId)
    {
        if (profileId == Guid.Empty)
            throw new ArgumentException("ProfileId is required.", nameof(profileId));

        ProfileId = profileId;
    }

    public void Update(
        bool experience,
        bool academics,
        bool skills,
        bool credentials,
        bool languages,
        bool achievements)
    {
        Experience = experience;
        Academics = academics;
        Skills = skills;
        Credentials = credentials;
        Languages = languages;
        Achievements = achievements;
    }

    public Showcase.Domain.Common.Results.Result ToggleSection(string section, bool isVisible)
    {
        if (string.IsNullOrWhiteSpace(section))
            return Showcase.Domain.Common.Results.Error.Validation("CareerVisibility.InvalidSection", "Career section name is required.");

        switch (section.Trim().ToLowerInvariant())
        {
            case "experience": Experience = isVisible; break;
            case "academics": Academics = isVisible; break;
            case "skills": Skills = isVisible; break;
            case "credentials": Credentials = isVisible; break;
            case "languages": Languages = isVisible; break;
            case "achievements": Achievements = isVisible; break;
            default:
                return Showcase.Domain.Common.Results.Error.Validation("CareerVisibility.InvalidSection", $"Unknown career section: '{section}'.");
        }

        return Showcase.Domain.Common.Results.Result.Success();
    }
}
