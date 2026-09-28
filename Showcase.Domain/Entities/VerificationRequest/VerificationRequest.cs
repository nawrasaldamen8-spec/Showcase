using System;
using Showcase.Domain.Common.BaseEntity;
using Showcase.Domain.Common.Results;
using Showcase.Domain.Enums;

namespace Showcase.Domain.Entities;

public class VerificationRequest : BaseEntity
{
    public string UserId { get; private set; } = string.Empty;
    public string Message { get; private set; } = string.Empty;
    public string Category { get; private set; } = string.Empty;
    public string? IdentificationNumber { get; private set; }
    public string? WebsiteUrl { get; private set; }
    public string? PortfolioUrl { get; private set; }
    public string? DocumentUrl { get; private set; }
    public VerificationStatus Status { get; private set; }
    public string? AdminNotes { get; private set; }
    public DateTime CreatedAtUtc { get; private set; }
    public DateTime? ReviewedAtUtc { get; private set; }

    private VerificationRequest() { } // EF Core

    public VerificationRequest(
        string userId,
        string message,
        string category = "other",
        string? identificationNumber = null,
        string? websiteUrl = null,
        string? portfolioUrl = null,
        string? documentUrl = null)
    {
        if (string.IsNullOrWhiteSpace(userId))
            throw new ArgumentException("UserId is required.", nameof(userId));

        if (string.IsNullOrWhiteSpace(message))
            throw new ArgumentException("Message is required.", nameof(message));

        UserId = userId.Trim();
        Message = message.Trim();
        Category = string.IsNullOrWhiteSpace(category) ? "other" : category.Trim().ToLowerInvariant();
        IdentificationNumber = string.IsNullOrWhiteSpace(identificationNumber) ? null : identificationNumber.Trim();
        WebsiteUrl = string.IsNullOrWhiteSpace(websiteUrl) ? null : websiteUrl.Trim();
        PortfolioUrl = string.IsNullOrWhiteSpace(portfolioUrl) ? null : portfolioUrl.Trim();
        DocumentUrl = string.IsNullOrWhiteSpace(documentUrl) ? null : documentUrl.Trim();
        Status = VerificationStatus.Pending;
        CreatedAtUtc = DateTime.UtcNow;
    }

    public Result Approve(string? adminNotes = null)
    {
        if (Status != VerificationStatus.Pending)
            return VerificationRequestErrors.NotPending;

        Status = VerificationStatus.Verified;
        AdminNotes = string.IsNullOrWhiteSpace(adminNotes) ? null : adminNotes.Trim();
        ReviewedAtUtc = DateTime.UtcNow;
        return Result.Success();
    }

    public Result Reject(string? adminNotes = null)
    {
        if (Status != VerificationStatus.Pending)
            return VerificationRequestErrors.NotPending;

        Status = VerificationStatus.Rejected;
        AdminNotes = string.IsNullOrWhiteSpace(adminNotes) ? null : adminNotes.Trim();
        ReviewedAtUtc = DateTime.UtcNow;
        return Result.Success();
    }
}
