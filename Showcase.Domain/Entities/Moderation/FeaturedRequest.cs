namespace Showcase.Domain.Entities;

public class FeaturedRequest : BaseEntity
{
    public string UserId { get; private set; } = string.Empty;
    public string Message { get; private set; } = string.Empty;
    public FeaturedStatus Status { get; private set; }
    public string? AdminNotes { get; private set; }
    public DateTime CreatedAtUtc { get; private set; }
    public DateTime? ReviewedAtUtc { get; private set; }

    private FeaturedRequest() { } // EF Core

    public FeaturedRequest(string userId, string message)
    {
        if (string.IsNullOrWhiteSpace(userId))
            throw new ArgumentException("UserId is required.", nameof(userId));

        if (string.IsNullOrWhiteSpace(message))
            throw new ArgumentException("Message is required.", nameof(message));

        UserId = userId.Trim();
        Message = message.Trim();
        Status = FeaturedStatus.Pending;
        CreatedAtUtc = DateTime.UtcNow;
    }

    public Result Approve(string? adminNotes = null)
    {
        Status = FeaturedStatus.Featured;
        AdminNotes = string.IsNullOrWhiteSpace(adminNotes) ? AdminNotes : adminNotes.Trim();
        ReviewedAtUtc = DateTime.UtcNow;
        return Result.Success();
    }

    public Result Reject(string? adminNotes = null)
    {
        Status = FeaturedStatus.Rejected;
        AdminNotes = string.IsNullOrWhiteSpace(adminNotes) ? AdminNotes : adminNotes.Trim();
        ReviewedAtUtc = DateTime.UtcNow;
        return Result.Success();
    }

    public void SetStatus(FeaturedStatus status, string? adminNotes = null)
    {
        Status = status;
        if (!string.IsNullOrWhiteSpace(adminNotes))
        {
            AdminNotes = adminNotes.Trim();
        }
        ReviewedAtUtc = DateTime.UtcNow;
    }
}
