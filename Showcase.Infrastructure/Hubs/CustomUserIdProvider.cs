using System.Security.Claims;
using Microsoft.AspNetCore.SignalR;
using Microsoft.IdentityModel.JsonWebTokens;

namespace Showcase.Infrastructure.Hubs;

public class CustomUserIdProvider : IUserIdProvider
{
    public string? GetUserId(HubConnectionContext connection)
    {
        return connection.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? connection.User?.FindFirst(JwtRegisteredClaimNames.Sub)?.Value
            ?? connection.User?.FindFirst("sub")?.Value
            ?? connection.User?.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")?.Value;
    }
}
