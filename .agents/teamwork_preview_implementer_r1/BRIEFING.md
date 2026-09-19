# BRIEFING — Implementer R1

## Task
Implement the Infrastructure layer (Showcase.Infrastructure) and required Application service contracts for the Showcase Portfolio Platform:
- R1: Application Service Contracts (ITokenService, ICurrentUserService, IStorageService)
- R2: Identity & JWT Authentication Services (JwtSettings, TokenService, CurrentUserService, JWT Bearer config with ClockSkew = TimeSpan.Zero)
- R3: Cloudflare R2 Object Storage Integration (AWSSDK.S3, R2Settings, CloudflareR2StorageService)
- R4: Dependency Injection Registration & appsettings.json updates

## Boundaries & Constraints
- Application depends ONLY on Domain.
- Domain remains pure C#.
- Infrastructure implements Application contracts and configures external dependencies.
- Build must succeed with 0 Warnings and 0 Errors.
