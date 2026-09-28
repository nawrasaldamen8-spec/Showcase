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
}
