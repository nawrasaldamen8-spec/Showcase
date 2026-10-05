namespace Showcase.Domain.Entities;

public class Skill : BaseEntity
{
    public Guid ProfileId { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public string? Category { get; private set; }
    public DateTime CreatedAtUtc { get; private set; } = DateTime.UtcNow;

    private Skill() { } // EF Core

    public Skill(Guid profileId, string name, string? category = null)
    {
        if (profileId == Guid.Empty)
            throw new ArgumentException("ProfileId is required.", nameof(profileId));

        ProfileId = profileId;
        Update(name, category);
    }

    public void Update(string name, string? category)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Name is required.", nameof(name));

        Name = name.Trim();
        Category = string.IsNullOrWhiteSpace(category) ? null : category.Trim();
    }
}
