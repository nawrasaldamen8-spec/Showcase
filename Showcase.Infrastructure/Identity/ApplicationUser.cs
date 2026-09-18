using System;
using Microsoft.AspNetCore.Identity;
using Showcase.Domain.Entities;

namespace Showcase.Infrastructure.Identity;

public class ApplicationUser : IdentityUser
{
    public string? RefreshToken { get; set; }
    public DateTime? RefreshTokenExpiryTime { get; set; }
    public Profile Profile { get; set; } = null!;
}
