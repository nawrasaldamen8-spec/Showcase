using System;
using System.Collections.Generic;

namespace Showcase.Application.Features.Auth.Queries.GetCurrentUser;

public record CurrentUserResponse(
    string Id,
    string Email,
    string Username,
    string FirstName,
    string LastName,
    Guid ProfileId,
    string? Bio,
    string? AvatarUrl,
    IList<string> Roles);
