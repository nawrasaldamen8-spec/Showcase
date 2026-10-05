namespace Showcase.Domain.Entities;

public class ProfileVisit : BaseEntity
{
    public Guid ProfileId { get; private set; }
    public string? VisitorUserId { get; private set; }
    public string? VisitorToken { get; private set; }
    public string HashedIp { get; private set; } = string.Empty;
    public DateTime VisitedAtUtc { get; private set; }

    private ProfileVisit() { } // EF Core

    public ProfileVisit(
        Guid profileId,
        string hashedIp,
        string? visitorUserId = null,
        string? visitorToken = null)
    {
        if (profileId == Guid.Empty)
            throw new ArgumentException("ProfileId is required.", nameof(profileId));

        if (string.IsNullOrWhiteSpace(hashedIp))
            throw new ArgumentException("HashedIp is required.", nameof(hashedIp));

        ProfileId = profileId;
        HashedIp = hashedIp.Trim();
        VisitorUserId = string.IsNullOrWhiteSpace(visitorUserId) ? null : visitorUserId.Trim();
        VisitorToken = string.IsNullOrWhiteSpace(visitorToken) ? null : visitorToken.Trim();
        VisitedAtUtc = DateTime.UtcNow;
    }
}
