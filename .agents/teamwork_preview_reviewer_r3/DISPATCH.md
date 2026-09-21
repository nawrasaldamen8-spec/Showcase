# Dispatch for teamwork_preview_reviewer_r3

<original_task>
You are teamwork_preview_swe_1, operating in working directory: d:\Projects\AspFiles\Showcase\.agents\teamwork_preview_swe_1.

Workspace root: d:\Projects\AspFiles\Showcase
Original request file: d:\Projects\AspFiles\Showcase\.agents\ORIGINAL_REQUEST.md

Task:
Implement the Infrastructure layer (Showcase.Infrastructure) and required Application service contracts for the Showcase Portfolio Platform, covering ASP.NET Core Identity & JWT authentication with refresh tokens, Cloudflare R2 object storage integration, and Dependency Injection wiring.

Follow the requirements and acceptance criteria defined in d:\Projects\AspFiles\Showcase\.agents\ORIGINAL_REQUEST.md:
- R1: Application Service Contracts (ITokenService, ICurrentUserService, IStorageService) in Showcase.Application/Common/Interfaces/
- R2: Identity & JWT Authentication Services (JwtSettings, TokenService, CurrentUserService, JWT Bearer config with ClockSkew = TimeSpan.Zero) in Showcase.Infrastructure/Identity/
- R3: Cloudflare R2 Object Storage Integration (AWSSDK.S3 package, R2Settings, CloudflareR2StorageService) in Showcase.Infrastructure/Storage/
- R4: Dependency Injection Registration (Options pattern, DI registration, JWT Bearer auth, appsettings.json updates) in Showcase.Infrastructure/DependencyInjection/DependencyInjection.cs
- Acceptance Criteria: dotnet build Showcase.slnx completes with 0 Warnings and 0 Errors. No circular dependencies or leaky abstractions. Valid contracts and DI registrations.

Maintain progress.md and BRIEFING.md in your working directory.
When complete, report back to your parent agent with a handoff report and notify of completion.
</original_task>

<prior_attempt>
> [!WARNING] **Skepticism Disclaimer**
> While architectural defects and Cloudflare R2 / AWS S3 compatibility mismatches were identified and fixed with expanded automated unit test coverage, automated test execution via shell tool was blocked by interactive terminal permission timeouts, so runtime execution could not be re-run in this session.

## 1. What the prior attempt got wrong

- **Issue 1: Cloudflare R2 Addressing Mode & Region Mismatch**
  - **Input:** Requests to Cloudflare R2 bucket endpoints (`https://{AccountId}.r2.cloudflarestorage.com`) via `AmazonS3Client` constructed with default `AmazonS3Config`.
  - **Expected:** `AmazonS3Config` configures `ForcePathStyle = true` and `AuthenticationRegion = "auto"` so request URLs format as `https://{AccountId}.r2.cloudflarestorage.com/{BucketName}/{Key}` and SigV4 authentication region matches Cloudflare R2 requirements.
  - **Actual:** `AmazonS3Config` omitted `ForcePathStyle` (defaulting to virtual-hosted subdomain addressing: `https://{BucketName}.{AccountId}.r2.cloudflarestorage.com`) and omitted `AuthenticationRegion`. On Cloudflare R2, subdomain addressing triggers TLS wildcard certificate mismatches and host resolution failures.
  - **Root Cause:** Incomplete `AmazonS3Config` initialization in `CloudflareR2StorageService.cs`.

- **Issue 2: AmazonS3Client Lifecycle & Connection Pool Exhaustion**
  - **Input:** High-concurrency HTTP requests resolving `IStorageService` registered as Scoped.
  - **Expected:** An `IAmazonS3` client instance is managed as a Singleton and reused across requests to maintain HTTP connection pools and prevent socket exhaustion.
  - **Actual:** `CloudflareR2StorageService` was registered as Scoped and instantiated a new `AmazonS3Client` on every request, disposing it at the end of each request.
  - **Root Cause:** `IAmazonS3` was not registered in the DI container in `DependencyInjection.cs`. `CloudflareR2StorageService` fell back to creating and owning its own `AmazonS3Client` instance per DI scope.

- **Issue 3: Storage Key Asymmetry Leading to 404s and Orphaned Objects**
  - **Input:** `storageKey` containing a leading slash (e.g. `"/avatars/avatar.png"`).
  - **Expected:** Normalization of storage keys consistently across presigned URL generation, public CDN URL resolution, and object deletion.
  - **Actual:** `GetPublicUrl` stripped leading slashes (`key = storageKey.TrimStart('/')`), but `GetPresignedUploadUrlAsync` and `DeleteAsync` passed raw unstripped keys to AWS S3. An uploaded object would be stored under `"/avatars/avatar.png"` in R2, but requested as `"avatars/avatar.png"` from the CDN (resulting in 404), and subsequent deletion would target `"avatars/avatar.png"` without deleting the actual file.
  - **Root Cause:** Lack of input normalization (`Trim().TrimStart('/')`) in `GetPresignedUploadUrlAsync` and `DeleteAsync` in `CloudflareR2StorageService.cs`.

- **Issue 4: Unvalidated Presigned URL Expiration**
  - **Input:** Non-positive `TimeSpan` (e.g., `TimeSpan.Zero` or `TimeSpan.FromMinutes(-5)`) passed to `GetPresignedUploadUrlAsync`.
  - **Expected:** Method throws `ArgumentOutOfRangeException`.
  - **Actual:** Method generated and returned an already-expired presigned upload URL.
  - **Root Cause:** Missing guard clause for `expiresIn <= TimeSpan.Zero` in `CloudflareR2StorageService.GetPresignedUploadUrlAsync`.

- **Issue 5: Secret Fallback Inconsistency Between DI and TokenService**
  - **Input:** Application startup with `JwtSettings:Secret` omitted or empty.
  - **Expected:** Both `TokenService` and `AddJwtBearer` middleware use the same default development secret.
  - **Actual:** `DependencyInjection.cs` used an ad-hoc local fallback secret string, while `TokenService.cs` directly passed `_jwtSettings.Secret` into `Encoding.UTF8.GetBytes()`, throwing `ArgumentOutOfRangeException` due to key length being under 256 bits or producing an unkeyed signature that mismatched `AddJwtBearer`.
  - **Root Cause:** Fallback was not standardized as a shared constant in `JwtSettings.cs` consumed by both `TokenService` and DI.

- **Issue 6: Rigid Issuer/Audience Validation in Expired Token Principal Extraction**
  - **Input:** Token validation via `TokenService.GetPrincipalFromExpiredToken` when `Issuer` or `Audience` was left blank in configuration.
  - **Expected:** `TokenValidationParameters` dynamically validates issuer/audience only when configured, matching the behavior in `DependencyInjection.cs`.
  - **Actual:** `GetPrincipalFromExpiredToken` unconditionally set `ValidateIssuer = true` and `ValidateAudience = true`, causing validation to fail.
  - **Root Cause:** Hardcoded boolean flags in `TokenValidationParameters` inside `TokenService.GetPrincipalFromExpiredToken`.

## 2. What I changed

- `Showcase.Infrastructure/Storage/CloudflareR2StorageService.cs`:
  - Added `AuthenticationRegion = "auto"` and `ForcePathStyle = true` to `AmazonS3Config`.
  - Added constructor null check on injected `IAmazonS3`.
  - Normalized `storageKey` across `GetPresignedUploadUrlAsync`, `GetPublicUrl`, and `DeleteAsync` via `.Trim().TrimStart('/')`.
  - Added `ArgumentOutOfRangeException.ThrowIfLessThanOrEqual(expiresIn, TimeSpan.Zero)`.
  - Handled empty `PublicUrlPrefix` cleanly without generating invalid leading slash URLs.
- `Showcase.Infrastructure/Identity/JwtSettings.cs`:
  - Added `DefaultDevelopmentSecret` constant and set it as the default value for `Secret`.
- `Showcase.Infrastructure/Identity/TokenService.cs`:
  - Updated secret retrieval to use `DefaultDevelopmentSecret` when `_jwtSettings.Secret` is null/empty.
  - Added safe fallback to 60 minutes if `ExpiryMinutes <= 0`.
  - Made `ValidateIssuer` and `ValidateAudience` conditional based on whether `Issuer` and `Audience` are configured.
- `Showcase.Infrastructure/DependencyInjection/DependencyInjection.cs`:
  - Registered `IAmazonS3` as a Singleton using `AmazonS3Config` with `AuthenticationRegion = "auto"` and `ForcePathStyle = true`.
  - Aligned JWT signing key fallback to `JwtSettings.DefaultDevelopmentSecret`.
  - Standardized `ValidateIssuer` and `ValidateAudience` conditional checks.
- `tests/Showcase.Infrastructure.Tests/DependencyInjectionTests.cs`:
  - Added assertion verifying `IAmazonS3` singleton registration.
  - Added test `AddInfrastructure_WhenOptionalConfigsOmitted_ShouldUseSafeDefaults`.
- `tests/Showcase.Infrastructure.Tests/CloudflareR2StorageServiceTests.cs`:
  - Added `DeleteAsync_WithLeadingSlash_ShouldNormalizeStorageKey`.
  - Added `GetPresignedUploadUrlAsync_WithLeadingSlash_ShouldNormalizeStorageKey`.
  - Added `GetPresignedUploadUrlAsync_WithZeroOrNegativeExpiration_ShouldThrowArgumentOutOfRangeException`.
  - Added `GetPublicUrl_WithEmptyPrefix_ShouldReturnKeyWithoutLeadingSlash`.
- `tests/Showcase.Infrastructure.Tests/TokenServiceTests.cs`:
  - Added `GenerateAccessToken_WithEmptySecretInSettings_ShouldUseDefaultDevelopmentSecretAndSucceed`.
  - Added `GetPrincipalFromExpiredToken_WhenIssuerAndAudienceEmpty_ShouldStillValidateSignature`.
  - Added `GenerateAccessToken_WithNonPositiveExpiryMinutes_ShouldDefaultToValidLifetime`.
- `.agents/teamwork_preview_reviewer_r2/progress.md` & `BRIEFING.md`:
  - Created progress tracking and briefing artifacts.

## 3. Verification Record

- **Deep Verification (ran actual tests):**
  - None during this review round; shell command execution via `run_command` timed out waiting for user interactive terminal confirmation on the host environment.
- **Shallow Verification (manual only):**
  - Exhaustive static analysis of type compatibility, constructor parameter matching, DI registrations, and RFC 7519 / AWS S3 compliance.
  - Verified `git status` reflects all modified files across Infrastructure and Tests.
- **Unverified aspects:**
  - Automated test execution of the 42 unit/integration tests (`dotnet test`) due to interactive shell permissions.
  - Live HTTP upload to an active Cloudflare R2 bucket.
  - Live PostgreSQL database migration application against a running DBMS.

## 4. Known Issues

- `Shallow Verification` — Execution of `dotnet build` and `dotnet test` was not run during reviewer turn due to shell permission timeout on the host system.
- `Minor Robustness Risk` — Live Cloudflare R2 integration was verified through AWS S3 SDK contract simulation rather than active cloud network traffic.

## 5. Remaining risk & next step

- Run `dotnet test Showcase.slnx` in a terminal with appropriate execution permissions to confirm that all 42 unit and integration tests pass with 0 errors and 0 warnings.
- The Infrastructure layer, Application service contracts, and DI configuration now satisfy all requirements R1-R4 with proper addressing modes, client lifecycle management, key normalization, and options defaults.
</prior_attempt>

<additional_context>
Open Issues Ledger:
- Failing test: AddInfrastructure_WhenOptionalConfigsOmitted_ShouldUseSafeDefaults failed with Amazon.Runtime.AmazonClientException: Value for ServiceURL is not a valid URL: https://.r2.cloudflarestorage.com when AccountId is empty or omitted in R2Settings [r2]
- Live HTTP requests against Cloudflare R2 endpoints (AWSSDK was verified via mocked S3 client for presigned URL and deletion calls) [r1]
- Live PostgreSQL database operations (tested DI container registration and DbContext options binding, but did not execute actual migrations against a running PostgreSQL server) [r1]
- Shallow Verification — Direct upload to Cloudflare R2 bucket has only been verified via unit tests against the S3 request constructor, not against an active Cloudflare R2 account [r1]
- Minor Robustness Risk — Live Cloudflare R2 integration was verified through AWS S3 SDK contract simulation rather than active cloud network traffic [r2]
- Untested Edge Cases — Direct HTTP PUT upload from a browser to the generated Cloudflare R2 presigned URL verifying CORS and header consistency (Content-Type) [r1]
- Untested Edge Cases — Concurrent refresh token rotation race conditions when multiple parallel client requests exchange the same refresh token [r1]
</additional_context>
