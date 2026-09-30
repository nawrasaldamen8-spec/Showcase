using System;
using System.Collections.Generic;
using Showcase.Domain.Enums;

namespace Showcase.Application.Features.Auth.Queries.GetCurrentUser;

public record CurrentUserResponse(
    string Id,
    string? Email,
    string Username,
    string Name,
    Guid ProfileId,
    string? Bio,
    string? AvatarUrl,
    bool IsVerified,
    VerificationStatus VerificationStatus,
    FeaturedStatus FeaturedStatus,
    bool IsBanned,
    string? BanReason,
    IList<string> Roles);
