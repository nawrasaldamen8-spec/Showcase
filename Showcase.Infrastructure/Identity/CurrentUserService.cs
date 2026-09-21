using System;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Showcase.Application.Common.Interfaces;

namespace Showcase.Infrastructure.Identity;

public class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUserService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor ?? throw new ArgumentNullException(nameof(httpContextAccessor));
    }

    public string? UserId
    {
        get
        {
            var user = _httpContextAccessor.HttpContext?.User;
            if (user is null)
                return null;

            var id = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!string.IsNullOrWhiteSpace(id))
                return id;

            id = user.FindFirst("sub")?.Value;
            return !string.IsNullOrWhiteSpace(id) ? id : null;
        }
    }

    public string? Email
    {
        get
        {
            var user = _httpContextAccessor.HttpContext?.User;
            if (user is null)
                return null;

            var email = user.FindFirst(ClaimTypes.Email)?.Value;
            if (!string.IsNullOrWhiteSpace(email))
                return email;

            email = user.FindFirst("email")?.Value;
            return !string.IsNullOrWhiteSpace(email) ? email : null;
        }
    }

    public bool IsAuthenticated =>
        _httpContextAccessor.HttpContext?.User?.Identity?.IsAuthenticated ?? false;
}
