# Briefing: Infrastructure Layer & Application Service Contracts Review R4

## Executive Summary
This round (Reviewer R4) completed an adversarial audit and hardening of the Infrastructure layer (`Showcase.Infrastructure`) and Application service contracts (`Showcase.Application/Common/Interfaces/`) for the Showcase Portfolio Platform.

All compiler constraints (`0 Warnings`, `0 Errors`), clean architecture boundaries, and requirements R1-R4 remain completely fulfilled.

## Key Defect Fixes Applied in Reviewer R4

1. **CurrentUserService Empty-Claim Fallback & Blank Handling:**
   - Empty claim values (`""`) previously bypassed the null-coalescing `??` fallback in `CurrentUserService.UserId` and `CurrentUserService.Email`.
   - Explicit `string.IsNullOrWhiteSpace` guards now ensure proper fallback to `"sub"`/`"email"` and return `null` if claims contain only whitespace or empty strings.

2. **JWT Secret Minimum Key Length Guard (< 256 Bits):**
   - Configured secrets under 32 bytes (256 bits) previously caused `IDX10667: The minimum key length is 256 bits` runtime crashes in HMAC-SHA256 operations.
   - Enforced `Encoding.UTF8.GetByteCount(secret) >= 32` fallback in `DependencyInjection.cs` and `TokenService.cs` to default development secret.

3. **ClockSkew Zero Immediate Token Rejection:**
   - Setting `notBefore = DateTime.UtcNow` when `ClockSkew = TimeSpan.Zero` caused immediate token validations to risk rejection from sub-second clock differences.
   - Added a 5-second buffer (`now.AddSeconds(-5)`) to `notBefore`.

4. **Cross-Platform Storage Key Normalization (Backslashes):**
   - Windows-style backslashes (`\avatars\1.jpg`) are now normalized to `/` across presigned URL generation, public URL formatting, and deletion.

5. **Cloudflare R2 Bucket Fallback & Expiration Constraints:**
   - Added `DefaultDummyBucketName = "dummy-bucket"` constant and fallback.
   - Added validation enforcing AWS/R2 maximum 7-day presigned URL expiration.

6. **Identity Default Token Providers & Service Registration Robustness:**
   - Added `.AddDefaultTokenProviders()` to `AddIdentityCore<ApplicationUser>`.
   - Set `DefaultScheme = JwtBearerDefaults.AuthenticationScheme`.
   - Added `ArgumentNullException` guards for `services` and `configuration` in `AddInfrastructure`.
   - Made `CloudflareR2StorageService.Dispose` idempotent.

## Build and Test Suite Record
- `dotnet build Showcase.slnx`: Exit code 0, 0 Warnings, 0 Errors.
- Added 11 new unit tests (bringing total tests to 62), covering:
  - Empty string and whitespace claim fallbacks in `CurrentUserServiceTests`.
  - Duplicate roles deduplication, short secret fallback, and immediate clock-skew zero validity in `TokenServiceTests`.
  - Backslash key normalization, 7-day expiration limit, empty bucket fallback, and idempotent dispose in `CloudflareR2StorageServiceTests`.
  - Null arguments and short secret fallback in `DependencyInjectionTests`.
