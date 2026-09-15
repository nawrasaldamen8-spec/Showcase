---
name: authorize-tokens
description: >-
  Use this skill when adding authorization to endpoints, configuring JWT Bearer authentication, implementing refresh token rotation, or setting up role/policy-based authorization. Guides middleware wiring and token management without over-engineering.
---

# Adding Authorization & JWT Tokens

This skill teaches how to add authorization, JWT Bearer, and refresh tokens to the Clean Architecture project proportionally to its size, avoiding over-engineering.

## File Placement

```text
Architecture.Application/
├── Common/
│   └── Interfaces/
│       └── ITokenService.cs                 → Token generation abstraction
└── Features/
    └── Auth/
        └── Commands/
            └── RefreshToken/
                ├── RefreshTokenCommand.cs
                └── RefreshTokenCommandHandler.cs

Architecture.Infrastructure/
├── Identity/
│   ├── JwtSettings.cs                       → Options class
│   └── TokenService.cs                      → JWT + refresh token implementation
├── Data/
│   └── Configurations/
│       └── RefreshTokenConfiguration.cs     → EF config (if persisting refresh tokens)
└── DependencyInjection/
    └── DependencyInjection.cs               → JWT Bearer + auth setup

Architecture.Api/
├── Endpoints/
│   └── Auth/
│       └── RefreshToken.cs                  → Refresh endpoint
└── Program.cs                               → Add UseAuthentication + UseAuthorization
```

## JWT Bearer Setup in Infrastructure DI

Add the following to `Architecture.Infrastructure/DependencyInjection/DependencyInjection.cs` inside the `AddInfrastructure()` method:

```csharp
services.Configure<JwtSettings>(configuration.GetSection(JwtSettings.SectionName));

var jwtSettings = configuration.GetSection(JwtSettings.SectionName).Get<JwtSettings>()!;

services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings.Issuer,
        ValidAudience = jwtSettings.Audience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.Secret)),
        ClockSkew = TimeSpan.Zero  // No tolerance for expired tokens
    };
});

services.AddAuthorization();
```

## Program.cs Middleware Order

Order is critical in `Architecture.Api/Program.cs`! **Authentication MUST come BEFORE Authorization**.

```csharp
app.UseExceptionHandler();
app.UseAuthentication();    // ← MUST come before Authorization
app.UseAuthorization();     // ← MUST come after Authentication
app.UseHttpsRedirection();
app.UseCors("AllowAll");
app.MapEndpoints();
```

## Adding Authorization to Endpoints

**Basic (require any authenticated user):**
```csharp
app.MapGet("api/products", async (...) => { ... })
    .RequireAuthorization();
```

**Role-based:**
```csharp
app.MapDelete("api/products/{id:guid}", async (...) => { ... })
    .RequireAuthorization(policy => policy.RequireRole("Admin"));
```

**Named policy:**
Register the policy in DI (in `AddApi` or `AddInfrastructure`):
```csharp
services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy => policy.RequireRole("Admin"));
    options.AddPolicy("CanManageProducts", policy => 
        policy.RequireClaim("Permission", "products:manage"));
});
```
Use it in the endpoint:
```csharp
app.MapDelete("api/products/{id:guid}", async (...) => { ... })
    .RequireAuthorization("AdminOnly");
```

**Allow anonymous (override global auth):**
```csharp
app.MapPost("api/auth/login", async (...) => { ... })
    .AllowAnonymous();
```

## Refresh Token Flow

Keep it simple and proportional to project size. A simple approach is to store the refresh token in the `ApplicationUser` table instead of a separate entity.

**1. Update ApplicationUser Entity:**
```csharp
// Add to ApplicationUser:
public string? RefreshToken { get; set; }
public DateTime? RefreshTokenExpiryTime { get; set; }
```

**2. RefreshTokenCommandHandler:**
```csharp
public record RefreshTokenCommand(string AccessToken, string RefreshToken) 
    : IRequest<Result<AuthResponse>>;

public class RefreshTokenCommandHandler : IRequestHandler<RefreshTokenCommand, Result<AuthResponse>>
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ITokenService _tokenService;

    public async Task<Result<AuthResponse>> Handle(RefreshTokenCommand request, CancellationToken ct)
    {
        // 1. Extract userId from expired access token (without validating lifetime)
        var principal = _tokenService.GetPrincipalFromExpiredToken(request.AccessToken);
        if (principal is null)
            return Error.Unauthorized("Auth.InvalidToken", "Invalid access token.");

        var userId = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var user = await _userManager.FindByIdAsync(userId!);

        if (user is null || user.RefreshToken != request.RefreshToken || user.RefreshTokenExpiryTime <= DateTime.UtcNow)
            return Error.Unauthorized("Auth.InvalidRefreshToken", "Invalid or expired refresh token.");

        // 2. Generate new token pair
        var roles = await _userManager.GetRolesAsync(user);
        var newAccessToken = _tokenService.GenerateAccessToken(user.Id, user.Email!, roles);
        var newRefreshToken = _tokenService.GenerateRefreshToken();

        // 3. Rotate refresh token
        user.RefreshToken = newRefreshToken;
        user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
        await _userManager.UpdateAsync(user);

        return new AuthResponse(newAccessToken, newRefreshToken);
    }
}
```

**3. Update ITokenService (Application layer):**
```csharp
ClaimsPrincipal? GetPrincipalFromExpiredToken(string token);
```

**4. Update TokenService Implementation (Infrastructure layer):**
```csharp
public ClaimsPrincipal? GetPrincipalFromExpiredToken(string token)
{
    var tokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateIssuerSigningKey = true,
        ValidateLifetime = false,  // ← Key: don't validate expiry
        ValidIssuer = _jwtSettings.Issuer,
        ValidAudience = _jwtSettings.Audience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.Secret))
    };

    var principal = new JwtSecurityTokenHandler().ValidateToken(token, tokenValidationParameters, out var securityToken);
    
    if (securityToken is not JwtSecurityToken jwtToken || 
        !jwtToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256, StringComparison.InvariantCultureIgnoreCase))
        return null;

    return principal;
}
```

## appsettings.json Configuration

```json
{
  "JwtSettings": {
    "Secret": "your-very-long-secret-key-at-least-32-characters",
    "Issuer": "Architecture.Api",
    "Audience": "Architecture.Api",
    "ExpiryMinutes": 30
  }
}
```

## Rules & Anti-Patterns

### ✅ DO
- **Use endpoint-level auth:** Prefer `.RequireAuthorization()` for most cases over an AuthorizationBehavior pipeline.
- **Use policies:** Employ policies for complex authorization rules.
- **Simple refresh logic:** Keep refresh token logic simple by storing it on the user entity and rotating it upon use.
- **Middleware order:** Ensure `Authentication` -> `Authorization` is respected in `Program.cs`.
- **DI Locations:** JWT Bearer setup goes in Infrastructure DI (`AddInfrastructure`). Authorization policies can go in API DI (`AddApi`) or Infrastructure DI. Token service interface in Application, implementation in Infrastructure.
- **Allow Anonymous:** Auth endpoints (`login`, `register`, `refresh`) must use `.AllowAnonymous()`.

### ❌ DO NOT
- Don't create custom auth middleware — use built-in `AddAuthentication().AddJwtBearer()`.
- Don't create a separate token microservice for a monolith project.
- Don't store access tokens in the database — they are meant to be stateless.
- Don't create complex token revocation for small projects — short access token expiry + refresh tokens is sufficient.
- Don't create an AuthorizationBehavior pipeline if you can use endpoint-level `.RequireAuthorization()`.
