using System;
using System.Collections.Generic;

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
    bool IsBanned,
    string? BanReason,
    IList<string> Roles);
