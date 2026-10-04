using System;
using Microsoft.AspNetCore.Identity;
using Showcase.Domain.Entities;

namespace Showcase.Infrastructure.Identity;

public class ApplicationUser : IdentityUser
{
    public string? RefreshToken { get; set; }
    public DateTime? RefreshTokenExpiryTime { get; set; }
    public string? PreviousRefreshToken { get; set; }
    public DateTime? PreviousRefreshTokenExpiryTime { get; set; }

    // Mirrors Profile moderation state. Identity does not read the Profile aggregate, so without this copy
    // a ban could never be enforced at sign-in.
    public bool IsBanned { get; set; }
    public string? BanReason { get; set; }
    public DateTime? BannedAtUtc { get; set; }

    public bool IsDeleted { get; set; }
    public DateTime? DeletedAtUtc { get; set; }

    public Profile Profile { get; set; } = null!;
}
