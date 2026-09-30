using System;
using Showcase.Domain.Common.BaseEntity;
using Showcase.Domain.ValueObjects;

namespace Showcase.Domain.Entities;

public class Credential : BaseEntity
{
    public Guid ProfileId { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public string IssuingOrganization { get; private set; } = string.Empty;

    /// <summary>Issue date through expiry. A null end means the credential does not expire.</summary>
    public DateRange Validity { get; private set; } = null!;

    public string? CredentialId { get; private set; }
    public Url? VerificationUrl { get; private set; }
    public StorageKey? MediaUrl { get; private set; }
    public DateTime CreatedAtUtc { get; private set; } = DateTime.UtcNow;

    private Credential() { } // EF Core

    public Credential(
        Guid profileId,
        string name,
        string issuingOrganization,
        DateRange validity,
        string? credentialId = null,
        Url? verificationUrl = null,
        StorageKey? mediaUrl = null)
    {
        if (profileId == Guid.Empty)
            throw new ArgumentException("ProfileId is required.", nameof(profileId));

        Validity = validity ?? throw new ArgumentNullException(nameof(validity));
        ProfileId = profileId;
        Update(name, issuingOrganization, validity, credentialId, verificationUrl, mediaUrl);
    }

    public void Update(
        string name,
        string issuingOrganization,
        DateRange validity,
        string? credentialId,
        Url? verificationUrl,
        StorageKey? mediaUrl)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Name is required.", nameof(name));

        if (string.IsNullOrWhiteSpace(issuingOrganization))
            throw new ArgumentException("IssuingOrganization is required.", nameof(issuingOrganization));

        Name = name.Trim();
        IssuingOrganization = issuingOrganization.Trim();
        Validity = validity ?? throw new ArgumentNullException(nameof(validity));
        CredentialId = Normalize(credentialId);
        VerificationUrl = verificationUrl;
        MediaUrl = mediaUrl;
    }

    private static string? Normalize(string? value) => string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}
