namespace Showcase.Domain.Entities;

public class Language : BaseEntity
{
    public Guid ProfileId { get; private set; }
    public string LanguageName { get; private set; } = string.Empty;
    public LanguageProficiency Proficiency { get; private set; }
    public DateTime CreatedAtUtc { get; private set; } = DateTime.UtcNow;

    private Language() { } // EF Core

    public Language(Guid profileId, string languageName, LanguageProficiency proficiency)
    {
        if (profileId == Guid.Empty)
            throw new ArgumentException("ProfileId is required.", nameof(profileId));

        ProfileId = profileId;
        Update(languageName, proficiency);
    }

    public void Update(string languageName, LanguageProficiency proficiency)
    {
        if (string.IsNullOrWhiteSpace(languageName))
            throw new ArgumentException("LanguageName is required.", nameof(languageName));

        LanguageName = languageName.Trim();
        Proficiency = proficiency;
    }
}
