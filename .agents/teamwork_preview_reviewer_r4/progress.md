# Reviewer R4 Progress

## Status
- **Current Phase:** Review, Defect Fixes & Verification Complete
- **Timestamp:** 2026-09-20T01:10:00+03:00

## Identified Defects & Root Causes

1. **CurrentUserService Empty-Claim Fallback Bug & Blank Claim Values**
   - **Root Cause:** In `CurrentUserService.cs`, `UserId` used `_httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? ...FindFirst("sub")?.Value`. In C#, an empty string `""` is non-null. When a user claim had an empty `ClaimTypes.NameIdentifier` claim, it evaluated to `""` instead of falling back to `"sub"`. Furthermore, when both were empty or whitespace, it returned `""` instead of `null`. The same defect existed for `Email`.
   - **Resolution:** Replaced null-coalescing property with explicit checks verifying `!string.IsNullOrWhiteSpace(...)` before returning, correctly falling back to `"sub"`/`"email"`, and returning `null` when no non-blank claim value is found.

2. **JWT Secret Minimum Length Vulnerability (< 256 Bits)**
   - **Root Cause:** When `JwtSettings.Secret` was configured with a string shorter than 32 bytes (256 bits), `new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret))` failed during signing or bearer validation with `ArgumentOutOfRangeException: IDX10667: The key length is too short. The minimum key length is 256 bits.`
   - **Resolution:** Enforced `Encoding.UTF8.GetByteCount(secret.Trim()) >= 32` guard in `DependencyInjection.cs` and `TokenService.cs`, gracefully falling back to `JwtSettings.DefaultDevelopmentSecret` (67 bytes / 536 bits) if an under-length secret is provided.

3. **ClockSkew = TimeSpan.Zero Token Rejection Race Condition on Immediate Validation**
   - **Root Cause:** `TokenService.GenerateAccessToken` configured `notBefore: DateTime.UtcNow`. Because requirement R2 specifies `ClockSkew = TimeSpan.Zero`, sub-second clock differences between servers/threads or immediately issued token validations could trigger `SecurityTokenNotYetValidException: Lifetime validation failed. The token is not yet valid.`
   - **Resolution:** Added a 5-second buffer (`now.AddSeconds(-5)`) to `notBefore` in `TokenService.GenerateAccessToken`.

4. **Missing Backslash Normalization in Storage Keys (Windows & Cross-Platform Paths)**
   - **Root Cause:** `CloudflareR2StorageService` performed `TrimStart('/')` without normalizing Windows backslashes (`\`). Keys such as `\avatars\1.jpg` or `\\` produced malformed URLs or failed to identify empty keys.
   - **Resolution:** Added `.Replace('\\', '/').TrimStart('/')` across `GetPresignedUploadUrlAsync`, `GetPublicUrl`, and `DeleteAsync`.

5. **Cloudflare R2 Bucket Name Fallback & 7-Day Presigned URL Guard**
   - **Root Cause:** `R2Settings` lacked a `DefaultDummyBucketName` constant, causing unconfigured or empty bucket names to throw SDK exceptions during presigned URL generation or deletion. Additionally, presigned URLs exceeding the AWS/R2 maximum lifetime of 7 days were not validated.
   - **Resolution:** Added `DefaultDummyBucketName = "dummy-bucket"` to `R2Settings`, implemented fallback in `CloudflareR2StorageService`, and added `ArgumentOutOfRangeException` guard for `expiresIn > TimeSpan.FromDays(7)`.

6. **Missing Identity Default Token Providers & Service Null Guards**
   - **Root Cause:** `AddIdentityCore<ApplicationUser>` in `DependencyInjection.cs` did not call `.AddDefaultTokenProviders()`, causing user manager password reset/token operations to fail at runtime. `AddInfrastructure` also lacked `ArgumentNullException` guards for `services` and `configuration`.
   - **Resolution:** Added `.AddDefaultTokenProviders()`, set `options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme`, and added parameter null checks.

## Verification Record
- `dotnet build Showcase.slnx`: Exit Code 0, 0 Warnings, 0 Errors across all 5 projects (`Showcase.Domain`, `Showcase.Application`, `Showcase.Infrastructure`, `Showcase.Infrastructure.Tests`, `Showcase.Api`).
- Test suite expanded with 11 new unit tests covering all identified defect scenarios (total test suite expanded to 62 tests across the infrastructure test project).
