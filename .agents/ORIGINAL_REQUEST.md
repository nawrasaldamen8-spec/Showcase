# Original User Request

## Initial Request — 2026-09-19T19:55:34Z

This is a single self-contained fix; keep it small and focused. Implement the Infrastructure layer (`Showcase.Infrastructure`) and required Application service contracts for the Showcase Portfolio Platform, covering ASP.NET Core Identity & JWT authentication with refresh tokens, Cloudflare R2 object storage integration, and Dependency Injection wiring.

Working directory: d:\Projects\AspFiles\Showcase
Integrity mode: development

## Requirements

### R1. Application Service Contracts

Define the necessary service interfaces in `Showcase.Application/Common/Interfaces/`:

- `ITokenService`: JWT access token generation, cryptographically secure refresh token generation, and principal extraction from expired tokens.
- `ICurrentUserService`: Authenticated user ID and email resolution from `HttpContext`.
- `IStorageService`: Cloudflare R2 object storage operations (presigned PUT upload URLs, public URL resolution, and image deletion).

### R2. Identity & JWT Authentication Services

In `Showcase.Infrastructure/Identity/`:

- Create `JwtSettings` options record (`Secret`, `Issuer`, `Audience`, `ExpiryMinutes`).
- Implement `TokenService` conforming to `ITokenService` using HMAC-SHA256 and secure random byte generation.
- Implement `CurrentUserService` conforming to `ICurrentUserService` using `IHttpContextAccessor`.
- Configure JWT Bearer token authentication in `DependencyInjection.cs` with strict validation parameters and `ClockSkew = TimeSpan.Zero`.

### R3. Cloudflare R2 Object Storage Integration

In `Showcase.Infrastructure/Storage/`:

- Add package `AWSSDK.S3` to `Showcase.Infrastructure.csproj`.
- Create `R2Settings` options record (`AccountId`, `AccessKeyId`, `SecretAccessKey`, `BucketName`, `PublicUrlPrefix`).
- Implement `CloudflareR2StorageService` conforming to `IStorageService` using `AmazonS3Client` pointing to `https://{AccountId}.r2.cloudflarestorage.com`.
- Provide presigned PUT URLs for client direct uploads, public URL generator, and object deletion.

### R4. Dependency Injection Registration

In `Showcase.Infrastructure/DependencyInjection/DependencyInjection.cs`:

- Bind `JwtSettings` and `R2Settings` via the Options pattern.
- Register `ITokenService`, `ICurrentUserService`, `IStorageService`, and `IHttpContextAccessor`.
- Configure `AddAuthentication` (JWT Bearer) and `AddAuthorization`.
- Update `appsettings.json` with configuration sections for `JwtSettings` and `CloudflareR2`.

## Acceptance Criteria

### Compilation & Type Safety

- [ ] `dotnet build Showcase.slnx` completes with 0 Warnings and 0 Errors.
- [ ] No circular dependencies or leaky abstractions (Domain remains pure C#; Application depends only on Domain).

### Contract Fulfillment

- [ ] `TokenService` correctly generates valid JWTs with expected claims and extracts principal from expired tokens without lifetime validation.
- [ ] `CloudflareR2StorageService` creates valid presigned PUT URLs with configured expiration.
- [ ] All services and options are registered in the DI container.
