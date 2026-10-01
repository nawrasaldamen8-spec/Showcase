using System;
using System.Collections.Generic;
using System.Linq;
using Showcase.Domain.Common.BaseEntity;
using Showcase.Domain.Common.Results;
using Showcase.Domain.Enums;
using Showcase.Domain.ValueObjects;

namespace Showcase.Domain.Entities;

public class Profile : BaseEntity
{
    public const string DefaultBanReason = "Violation of platform policies";

    private static readonly Dictionary<FeaturedStatus, FeaturedStatus[]> AllowedFeaturedTransitions = new()
    {
        [FeaturedStatus.None] = [FeaturedStatus.Pending, FeaturedStatus.Featured],
        [FeaturedStatus.Pending] = [FeaturedStatus.Featured, FeaturedStatus.Rejected, FeaturedStatus.None],
        [FeaturedStatus.Featured] = [FeaturedStatus.None],
        [FeaturedStatus.Rejected] = [FeaturedStatus.Pending, FeaturedStatus.None]
    };

    private readonly List<SocialLink> _socialLinks = new();
    private readonly List<Experience> _experiences = new();
    private readonly List<Academic> _academics = new();
    private readonly List<Skill> _skills = new();
    private readonly List<Credential> _credentials = new();
    private readonly List<Language> _languages = new();
    private readonly List<Achievement> _achievements = new();

    public string UserId { get; private set; } = string.Empty;
    public string Name { get; private set; } = string.Empty;
    public string? Specialty { get; private set; }
    public string? Country { get; private set; }
    public Bio? Bio { get; private set; }
    public StorageKey? AvatarKey { get; private set; }

    public bool IsVerified { get; private set; }
    public VerificationStatus VerificationStatus { get; private set; }
    public FeaturedStatus FeaturedStatus { get; private set; }

    public bool IsBanned { get; private set; }
    public string? BanReason { get; private set; }
    public DateTime? BannedAtUtc { get; private set; }

    public bool IsDeleted { get; private set; }
    public DateTime? DeletedAtUtc { get; private set; }

    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }

    public IReadOnlyCollection<SocialLink> SocialLinks => _socialLinks.AsReadOnly();
    public IReadOnlyCollection<Experience> Experiences => _experiences.AsReadOnly();
    public IReadOnlyCollection<Academic> Academics => _academics.AsReadOnly();
    public IReadOnlyCollection<Skill> Skills => _skills.AsReadOnly();
    public IReadOnlyCollection<Credential> Credentials => _credentials.AsReadOnly();
    public IReadOnlyCollection<Language> Languages => _languages.AsReadOnly();
    public IReadOnlyCollection<Achievement> Achievements => _achievements.AsReadOnly();

    /// <summary>Private setter so EF Core can materialize the one-to-one row it owns.</summary>
    public CareerVisibility CareerVisibility { get; private set; } = null!;

    private Profile() { } // EF Core

    public Profile(
        string userId,
        string name,
        string? specialty = null,
        string? country = null,
        Bio? bio = null,
        StorageKey? avatarKey = null)
    {
        if (string.IsNullOrWhiteSpace(userId))
            throw new ArgumentException("UserId is required.", nameof(userId));

        UserId = userId;
        SetDetails(name, specialty, country, bio);
        AvatarKey = avatarKey;
        CareerVisibility = new CareerVisibility(Id);
        VerificationStatus = VerificationStatus.None;
        FeaturedStatus = FeaturedStatus.None;
        CreatedAt = DateTime.UtcNow;
    }

    public void UpdateDetails(string name, string? specialty, string? country, Bio? bio)
    {
        SetDetails(name, specialty, country, bio);
        Touch();
    }

    public void SetAvatar(StorageKey avatarKey)
    {
        AvatarKey = avatarKey ?? throw new ArgumentNullException(nameof(avatarKey));
        Touch();
    }

    public void RemoveAvatar()
    {
        AvatarKey = null;
        Touch();
    }

    public void Ban(string? reason)
    {
        IsBanned = true;
        BanReason = Normalize(reason) ?? DefaultBanReason;
        BannedAtUtc = DateTime.UtcNow;
        Touch();
    }

    public void Unban()
    {
        IsBanned = false;
        BanReason = null;
        BannedAtUtc = null;
        Touch();
    }

    public void SoftDelete()
    {
        IsDeleted = true;
        DeletedAtUtc = DateTime.UtcNow;
        Touch();
    }

    public void Restore()
    {
        IsDeleted = false;
        DeletedAtUtc = null;
        Touch();
    }

    /// <summary>Moves a profile into the verification review queue. Idempotent while already queued or verified.</summary>
    public Result RequestVerification()
    {
        if (VerificationStatus is VerificationStatus.Pending or VerificationStatus.Verified)
            return ProfileErrors.VerificationNotRequestable(VerificationStatus);

        VerificationStatus = VerificationStatus.Pending;
        Touch();
        return Result.Success();
    }

    public void MarkVerified(bool verified = true)
    {
        IsVerified = verified;
        VerificationStatus = verified ? VerificationStatus.Verified : VerificationStatus.None;
        Touch();
    }

    public Result RejectVerification()
    {
        if (VerificationStatus is not VerificationStatus.Pending)
            return ProfileErrors.VerificationNotPending(VerificationStatus);

        IsVerified = false;
        VerificationStatus = VerificationStatus.Rejected;
        Touch();
        return Result.Success();
    }

    /// <summary>Guards the review queue so a profile cannot be featured without a pending request.</summary>
    public Result SetFeaturedStatus(FeaturedStatus status)
    {
        if (status == FeaturedStatus)
            return Result.Success();

        if (!AllowedFeaturedTransitions[FeaturedStatus].Contains(status))
            return ProfileErrors.InvalidFeaturedTransition(FeaturedStatus, status);

        FeaturedStatus = status;
        Touch();
        return Result.Success();
    }

    public void UpdateVisibility(
        bool experience,
        bool academics,
        bool skills,
        bool credentials,
        bool languages,
        bool achievements)
    {
        CareerVisibility.Update(experience, academics, skills, credentials, languages, achievements);
        Touch();
    }

    public SocialLink AddSocialLink(string platform, Url url, int? displayOrder = null)
    {
        var order = displayOrder ?? (_socialLinks.Count > 0 ? _socialLinks.Max(x => x.DisplayOrder) + 1 : 0);
        var link = new SocialLink(Id, platform, url, order);
        _socialLinks.Add(link);
        Touch();
        return link;
    }

    public Result UpdateSocialLink(Guid socialLinkId, string platform, Url url)
    {
        var link = _socialLinks.FirstOrDefault(l => l.Id == socialLinkId);
        if (link is null)
            return SocialLinkErrors.NotFound(socialLinkId);

        link.Update(platform, url);
        Touch();
        return Result.Success();
    }

    public Result RemoveSocialLink(Guid socialLinkId)
    {
        var link = _socialLinks.FirstOrDefault(l => l.Id == socialLinkId);
        if (link is null)
            return SocialLinkErrors.NotFound(socialLinkId);

        _socialLinks.Remove(link);
        Touch();
        return Result.Success();
    }

    public void ReorderSocialLinks(IReadOnlyDictionary<Guid, int> orderedSocialLinks)
    {
        ArgumentNullException.ThrowIfNull(orderedSocialLinks);

        foreach (var (id, order) in orderedSocialLinks)
        {
            var link = _socialLinks.FirstOrDefault(l => l.Id == id);
            link?.SetDisplayOrder(order);
        }

        Touch();
    }

    public Experience AddExperience(
        string jobTitle,
        string company,
        DateRange period,
        string? description = null,
        string? achievements = null,
        string? employmentType = null,
        string? location = null)
    {
        var experience = new Experience(Id, jobTitle, company, period, description, achievements, employmentType, location);
        _experiences.Add(experience);
        Touch();
        return experience;
    }

    public Academic AddAcademic(
        string institution,
        string degree,
        string fieldOfStudy,
        DateRange period,
        string? gpa = null,
        string? achievements = null,
        string? location = null,
        string? description = null)
    {
        var academic = new Academic(Id, institution, degree, fieldOfStudy, period, gpa, achievements, location, description);
        _academics.Add(academic);
        Touch();
        return academic;
    }

    public Skill AddSkill(string name, string? category = null)
    {
        var skill = new Skill(Id, name, category);
        _skills.Add(skill);
        Touch();
        return skill;
    }

    public Credential AddCredential(
        string name,
        string issuingOrganization,
        DateRange validity,
        string? credentialId = null,
        Url? verificationUrl = null,
        StorageKey? mediaUrl = null)
    {
        var credential = new Credential(Id, name, issuingOrganization, validity, credentialId, verificationUrl, mediaUrl);
        _credentials.Add(credential);
        Touch();
        return credential;
    }

    public Language AddLanguage(string languageName, LanguageProficiency proficiency)
    {
        var language = new Language(Id, languageName, proficiency);
        _languages.Add(language);
        Touch();
        return language;
    }

    public Achievement AddAchievement(
        string title,
        string? type = null,
        string? organization = null,
        string? date = null,
        Url? url = null,
        StorageKey? mediaUrl = null,
        string? description = null)
    {
        var achievement = new Achievement(Id, title, type, organization, date, url, mediaUrl, description);
        _achievements.Add(achievement);
        Touch();
        return achievement;
    }

    private void Touch() => UpdatedAt = DateTime.UtcNow;

    /// <summary>Shared by the constructor and <see cref="UpdateDetails"/>; deliberately does not stamp UpdatedAt.</summary>
    private void SetDetails(string name, string? specialty, string? country, Bio? bio)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Name is required.", nameof(name));

        Name = name.Trim();
        Specialty = Normalize(specialty);
        Country = Normalize(country);
        Bio = bio;
    }

    private static string? Normalize(string? value) => string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}
