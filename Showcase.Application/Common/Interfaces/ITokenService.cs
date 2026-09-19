using System.Collections.Generic;
using System.Security.Claims;

namespace Showcase.Application.Common.Interfaces;

public interface ITokenService
{
    string GenerateAccessToken(string userId, string email, IList<string>? roles = null);
    string GenerateRefreshToken();
    ClaimsPrincipal? GetPrincipalFromExpiredToken(string token);
}
