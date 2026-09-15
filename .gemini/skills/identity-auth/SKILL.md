---
name: identity-auth
description: >-
  Use this skill when setting up ASP.NET Identity, creating login/register features, configuring ApplicationUser, or retrieving user information. Guides Identity integration across all layers of the Clean Architecture project.
---

# Setting up ASP.NET Identity

## 1. Overview
Setting up ASP.NET Identity in this Clean Architecture project touches all 4 layers while respecting dependency rules.

## 2. File Placement Guide
```text
Architecture.Domain/
└── Entities/
    └── ApplicationUser.cs              → Only if user has domain behavior

Architecture.Application/
├── Common/
│   └── Interfaces/
│       ├── IApplicationDbContext.cs     → Already exists
│       ├── ITokenService.cs             → Token generation abstraction
│       └── ICurrentUserService.cs       → Get current authenticated user
└── Features/
    └── Auth/
        ├── Commands/
        │   ├── Register/
        │   │   ├── RegisterCommand.cs
        │   │   ├── RegisterCommandHandler.cs
        │   │   └── RegisterCommandValidator.cs
        │   └── Login/
        │       ├── LoginCommand.cs
        │       ├── LoginCommandHandler.cs
        │       └── AuthResponse.cs             → Shared response (AccessToken + RefreshToken)
        └── Queries/
            └── GetCurrentUser/
                ├── GetCurrentUserQuery.cs
                ├── GetCurrentUserQueryHandler.cs
                └── UserResponse.cs

Architecture.Infrastructure/
├── Identity/
│   ├── ApplicationUser.cs              → If no domain behavior (simpler approach)
│   ├── TokenService.cs                 → JWT generation implementation
│   └── CurrentUserService.cs           → Reads from HttpContext.User
├── Data/
│   ├── ApplicationDbContext.cs          → Modified to extend IdentityDbContext
│   └── Configurations/
│       └── ApplicationUserConfiguration.cs
└── DependencyInjection/
    └── DependencyInjection.cs           → Register Identity + JWT services

Architecture.Api/
└── Endpoints/
    └── Auth/
        ├── Register.cs
        ├── Login.cs
        └── GetCurrentUser.cs
```

## 3. ApplicationUser Setup

**Option A: User in Infrastructure (simpler, recommended for most cases)**
Create `ApplicationUser.cs` in `Architecture.Infrastructure/Identity/`:
```csharp
using Microsoft.AspNetCore.Identity;

namespace Architecture.Infrastructure.Identity;

public class ApplicationUser : IdentityUser
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
}
```

**Option B: User in Domain (if user has rich domain behavior)**
Only do this if the user entity has domain logic beyond just auth fields.

## 4. ApplicationDbContext Changes
Change from `DbContext` to `IdentityDbContext<ApplicationUser>` in `Architecture.Infrastructure/Data/ApplicationDbContext.cs`:
```csharp
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;

public class ApplicationDbContext : IdentityDbContext<ApplicationUser>, IApplicationDbContext
{
    // Everything else stays the same
}
```

Required NuGet package for Infrastructure:
```
Microsoft.AspNetCore.Identity.EntityFrameworkCore
```

## 5. ITokenService Interface
Create `ITokenService.cs` in `Architecture.Application/Common/Interfaces/`:
```csharp
namespace Architecture.Application.Common.Interfaces;

public interface ITokenService
{
    string GenerateAccessToken(string userId, string email, IList<string> roles);
    string GenerateRefreshToken();
}
```

## 6. TokenService Implementation
Create `TokenService.cs` in `Architecture.Infrastructure/Identity/`:
```csharp
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Architecture.Application.Common.Interfaces;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace Architecture.Infrastructure.Identity;

public class TokenService : ITokenService
{
    private readonly JwtSettings _jwtSettings;

    public TokenService(IOptions<JwtSettings> options)
    {
        _jwtSettings = options.Value;
    }

    public string GenerateAccessToken(string userId, string email, IList<string> roles)
    {
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, userId),
            new(ClaimTypes.Email, email)
        };
        claims.AddRange(roles.Select(role => new Claim(ClaimTypes.Role, role)));

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.Secret));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _jwtSettings.Issuer,
            audience: _jwtSettings.Audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(_jwtSettings.ExpiryMinutes),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public string GenerateRefreshToken()
    {
        return Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));
    }
}
```

## 7. Register Feature
Create files in `Architecture.Application/Features/Auth/Commands/Register/`:

```csharp
// RegisterCommand.cs
public record RegisterCommand(string Email, string Password, string FirstName, string LastName)
    : IRequest<Result<AuthResponse>>;

// AuthResponse.cs (shared across Login and Register)
public record AuthResponse(string AccessToken, string RefreshToken);

// RegisterCommandValidator.cs
public class RegisterCommandValidator : AbstractValidator<RegisterCommand>
{
    public RegisterCommandValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Password).NotEmpty().MinimumLength(6);
        RuleFor(x => x.FirstName).NotEmpty();
        RuleFor(x => x.LastName).NotEmpty();
    }
}

// RegisterCommandHandler.cs
public class RegisterCommandHandler : IRequestHandler<RegisterCommand, Result<AuthResponse>>
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ITokenService _tokenService;

    public RegisterCommandHandler(UserManager<ApplicationUser> userManager, ITokenService tokenService)
    {
        _userManager = userManager;
        _tokenService = tokenService;
    }

    public async Task<Result<AuthResponse>> Handle(RegisterCommand request, CancellationToken ct)
    {
        var existingUser = await _userManager.FindByEmailAsync(request.Email);
        if (existingUser is not null)
            return Error.Conflict("Auth.EmailTaken", "Email is already registered.");

        var user = new ApplicationUser
        {
            Email = request.Email,
            UserName = request.Email,
            FirstName = request.FirstName,
            LastName = request.LastName
        };

        var identityResult = await _userManager.CreateAsync(user, request.Password);
        if (!identityResult.Succeeded)
            return Error.Validation("Auth.RegistrationFailed", identityResult.Errors.First().Description);

        var roles = await _userManager.GetRolesAsync(user);
        var accessToken = _tokenService.GenerateAccessToken(user.Id, user.Email!, roles);
        var refreshToken = _tokenService.GenerateRefreshToken();

        return new AuthResponse(accessToken, refreshToken);
    }
}
```

## 8. Login Feature
Create files in `Architecture.Application/Features/Auth/Commands/Login/`:

```csharp
// LoginCommand.cs
public record LoginCommand(string Email, string Password) : IRequest<Result<AuthResponse>>;

// LoginCommandHandler.cs
public class LoginCommandHandler : IRequestHandler<LoginCommand, Result<AuthResponse>>
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ITokenService _tokenService;

    public async Task<Result<AuthResponse>> Handle(LoginCommand request, CancellationToken ct)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user is null)
            return Error.Unauthorized("Auth.InvalidCredentials", "Invalid email or password.");

        var validPassword = await _userManager.CheckPasswordAsync(user, request.Password);
        if (!validPassword)
            return Error.Unauthorized("Auth.InvalidCredentials", "Invalid email or password.");

        var roles = await _userManager.GetRolesAsync(user);
        var accessToken = _tokenService.GenerateAccessToken(user.Id, user.Email!, roles);
        var refreshToken = _tokenService.GenerateRefreshToken();

        return new AuthResponse(accessToken, refreshToken);
    }
}
```

## 9. GetCurrentUser Feature

```csharp
// ICurrentUserService.cs (in Architecture.Application/Common/Interfaces/)
public interface ICurrentUserService
{
    string? UserId { get; }
}

// CurrentUserService.cs (in Architecture.Infrastructure/Identity/)
public class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;
    public CurrentUserService(IHttpContextAccessor httpContextAccessor)
        => _httpContextAccessor = httpContextAccessor;

    public string? UserId => _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
}

// GetCurrentUserQuery.cs (in Architecture.Application/Features/Auth/Queries/GetCurrentUser/)
public record GetCurrentUserQuery : IRequest<Result<UserResponse>>;
public record UserResponse(string Id, string Email, string FirstName, string LastName);

// Handler uses ICurrentUserService to get the userId, then queries UserManager
```

## 10. DI Registration in Infrastructure
Update `DependencyInjection.cs` in `Architecture.Infrastructure/DependencyInjection/`:
```csharp
// Add to AddInfrastructure():
services.AddIdentity<ApplicationUser, IdentityRole>(options =>
{
    options.Password.RequireDigit = true;
    options.Password.RequireLowercase = true;
    options.Password.RequireUppercase = true;
    options.Password.RequiredLength = 6;
    options.User.RequireUniqueEmail = true;
})
.AddEntityFrameworkStores<ApplicationDbContext>()
.AddDefaultTokenProviders();

services.AddScoped<ITokenService, TokenService>();
services.AddScoped<ICurrentUserService, CurrentUserService>();
services.AddHttpContextAccessor();
```

## 11. API Endpoints
Create endpoints in `Architecture.Api/Endpoints/Auth/`:

```csharp
// Register.cs
public class Register : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost("api/auth/register", async (RegisterCommand command, ISender sender, CancellationToken ct) =>
        {
            var result = await sender.Send(command, ct);
            return result.ToResponse();
        })
        .WithTags("Auth")
        .WithName(nameof(Register));
    }
}

// Login.cs and GetCurrentUser.cs follow the same pattern
// GetCurrentUser should use .RequireAuthorization()
```

## 12. Required NuGet Packages
- **Infrastructure:** `Microsoft.AspNetCore.Identity.EntityFrameworkCore`, `Microsoft.AspNetCore.Authentication.JwtBearer`, `System.IdentityModel.Tokens.Jwt`
- No new packages needed for Application or Domain.

## 13. Rules
- Keep `ApplicationUser` simple — don't over-engineer with domain logic unless genuinely needed.
- `UserManager` and `SignInManager` are injected in Application handlers (they come from DI).
- Token generation logic lives in Infrastructure, interface in Application.
- Auth endpoints go under `api/auth/` route prefix.
- NEVER store passwords manually — always use `UserManager`.
