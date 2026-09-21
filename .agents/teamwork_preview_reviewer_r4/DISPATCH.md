# Dispatch for teamwork_preview_reviewer_r4

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
> While compilation succeeded with 0 warnings and 0 errors and all defects were resolved with expanded test coverage, automated test runner execution was blocked by host terminal permission timeouts, so runtime test execution was only partially verified.

## 1. What the prior attempt got wrong

- **Issue 1: Cloudflare R2 ServiceURL Malformed Hostname on Missing Configuration**
  - **Input:** Resolving `IAmazonS3` or `IStorageService` when `CloudflareR2` configuration section or `AccountId` was omitted or empty in `appsettings.json` (as tested by `AddInfrastructure_WhenOptionalConfigsOmitted_ShouldUseSafeDefaults`).
  - **Expected:** S3 client is initialized with a valid development fallback ServiceURL without throwing an exception.
  - **Actual:** `Amazon.Runtime.AmazonClientException: Value for ServiceURL is not a valid URL: https://.r2.cloudflarestorage.com`.
  - **Root Cause:** `DependencyInjection.cs` interpolated `r2Options.AccountId` into `$"https://{r2Options.AccountId}.r2.cloudflarestorage.com"` without validating against null, empty, or whitespace strings. `AmazonS3Config.NormalizeServiceURL` rejects hostnames starting with a dot.

- **Issue 2: Single-Argument Constructor Vulnerability in CloudflareR2StorageService**
  - **Input:** Instantiating `CloudflareR2StorageService` using its 1-argument constructor `new CloudflareR2StorageService(options)` with unpopulated or default `R2Settings`.
  - **Expected:** Constructor gracefully defaults `AccountId`, `AccessKeyId`, and `SecretAccessKey` to fallback constants.
  - **Actual:** Directly interpolated unvalidated `_settings.AccountId` into `ServiceURL`, throwing `AmazonClientException: Value for ServiceURL is not a valid URL: https://.r2.cloudflarestorage.com`.
  - **Root Cause:** Missing fallback handling for empty `AccountId` in `CloudflareR2StorageService(IOptions<R2Settings>)`.

- **Issue 3: Slash-Only Storage Keys Generating Malformed Presigned URLs and S3 Requests**
  - **Input:** Storage keys consisting solely of slashes or spaces, e.g. `"/"`, `"///"`, or `"   /   "` passed to `GetPresignedUploadUrlAsync`, `GetPublicUrl`, or `DeleteAsync`.
  - **Expected:** `GetPresignedUploadUrlAsync` throws `ArgumentException`; `GetPublicUrl` returns `string.Empty`; `DeleteAsync` early-exits without issuing an S3 deletion request.
  - **Actual:** `TrimStart('/')` reduced `"///"` to `""`, bypassing whitespace checks and issuing presigned PUT requests and deletion commands against the bucket root (`""`), while `GetPublicUrl` returned a trailing slash prefix (`"https://cdn.showcase.com/"`).
  - **Root Cause:** Lack of post-normalization validation on `normalizedKey` after stripping leading slashes.

- **Issue 4: Unenforced JWT Signing Algorithm Permitting Algorithm Substitution**
  - **Input:** JWT Bearer authentication options and expired token principal extraction.
  - **Expected:** Validation explicitly enforces `SecurityAlgorithms.HmacSha256` to prevent algorithm substitution attacks.
  - **Actual:** `TokenValidationParameters` omitted `ValidAlgorithms`, leaving algorithm verification to default permissive handling.
  - **Root Cause:** `ValidAlgorithms` was not specified on `TokenValidationParameters` in `DependencyInjection.cs` and `TokenService.cs`.

- **Issue 5: Missing Null Guards and Unsanitized Role Claims**
  - **Input:** Passing `null` to `CurrentUserService` or `TokenService` constructors, or passing `roles` containing empty/whitespace strings to `GenerateAccessToken`.
  - **Expected:** Constructor throws `ArgumentNullException`; role claims with empty strings are filtered out.
  - **Actual:** Constructors accepted null causing deferred `NullReferenceException`; empty strings were added as role claims.
  - **Root Cause:** Missing constructor argument null checks and lack of whitespace filtering on role enumerable.

## 2. What I changed

- `Showcase.Infrastructure/Storage/R2Settings.cs`:
  - Added `DefaultDummyAccountId`, `DefaultDummyAccessKey`, and `DefaultDummySecretKey` constants.
- `Showcase.Infrastructure/DependencyInjection/DependencyInjection.cs`:
  - Handled null/whitespace `AccountId` by falling back to `R2Settings.DefaultDummyAccountId`.
  - Added `ValidAlgorithms = new[] { SecurityAlgorithms.HmacSha256 }` to `TokenValidationParameters` in `AddJwtBearer`.
- `Showcase.Infrastructure/Storage/CloudflareR2StorageService.cs`:
  - Added `ArgumentNullException.ThrowIfNull(options)` and fallback logic using `R2Settings` dummy constants in the 1-argument constructor.
  - Added null check on `options` in 2-argument constructor.
  - Added `ct.ThrowIfCancellationRequested()` in `GetPresignedUploadUrlAsync` and `DeleteAsync`.
  - Added post-trim check on `normalizedKey` in `GetPresignedUploadUrlAsync` (throws `ArgumentException`), `GetPublicUrl` (returns `string.Empty`), and `DeleteAsync` (returns early).
- `Showcase.Infrastructure/Identity/TokenService.cs`:
  - Added `ArgumentNullException.ThrowIfNull(jwtOptions)`.
  - Filtered null/whitespace role strings in `GenerateAccessToken`.
  - Added `ValidAlgorithms = new[] { SecurityAlgorithms.HmacSha256 }` to `TokenValidationParameters` in `GetPrincipalFromExpiredToken`.
- `Showcase.Infrastructure/Identity/CurrentUserService.cs`:
  - Added `ArgumentNullException.ThrowIfNull(httpContextAccessor)`.
- `tests/Showcase.Infrastructure.Tests/CloudflareR2StorageServiceTests.cs`:
  - Added `Constructor_WithEmptyOptions_ShouldInstantiateWithoutException`.
  - Added `GetPresignedUploadUrlAsync_WithSlashOnlyKey_ShouldThrowArgumentException`.
  - Added `GetPresignedUploadUrlAsync_WithCancelledToken_ShouldThrowOperationCanceledException`.
  - Added `GetPublicUrl_WithSlashOnlyKey_ShouldReturnEmptyString`.
  - Added `DeleteAsync_WithSlashOnlyKey_ShouldNotCallS3Client`.
- `tests/Showcase.Infrastructure.Tests/CurrentUserServiceTests.cs`:
  - Added `Constructor_WhenHttpContextAccessorIsNull_ShouldThrowArgumentNullException`.
- `tests/Showcase.Infrastructure.Tests/TokenServiceTests.cs`:
  - Added `Constructor_WhenJwtOptionsIsNull_ShouldThrowArgumentNullException`.
  - Added `GenerateAccessToken_WithNullOrWhitespaceRoles_ShouldFilterThemOut`.
- `.agents/teamwork_preview_reviewer_r3/progress.md` & `BRIEFING.md`:
  - Created progress tracking and briefing artifacts.

## 3. Verification Record

- **Deep Verification (ran actual tests):**
  - Ran `dotnet build Showcase.slnx`: Exit Code 0, 0 Warnings, 0 Errors across all 5 projects (`Showcase.Domain`, `Showcase.Application`, `Showcase.Infrastructure`, `Showcase.Infrastructure.Tests`, `Showcase.Api`).
  - Ran initial `dotnet test` reproducing `AddInfrastructure_WhenOptionalConfigsOmitted_ShouldUseSafeDefaults` failure (43 passed, 1 failed) with `Amazon.Runtime.AmazonClientException: Value for ServiceURL is not a valid URL: https://.r2.cloudflarestorage.com`.
- **Shallow Verification (manual only):**
  - Verified fix for `AddInfrastructure_WhenOptionalConfigsOmitted_ShouldUseSafeDefaults` ensuring `AmazonS3Config.ServiceURL` resolves to `https://dummy-account-id.r2.cloudflarestorage.com`, a valid URI.
  - Verified architectural boundaries: pure C# Domain (0 dependencies), Application (depends only on Domain), and Infrastructure implementing Application service contracts.
- **Unverified aspects:**
  - Re-running `dotnet test` was blocked by host terminal permission prompt timeouts.
  - Live HTTP PUT upload against Cloudflare R2 endpoints over the internet.
  - Live database operations against a running PostgreSQL server.

## 4. Known Issues

- `Shallow Verification` — Final re-run of `dotnet test` could not be completed during reviewer turn due to host terminal permission prompt timeouts.
- `Minor Robustness Risk` — Live Cloudflare R2 network operations are simulated via AWS SDK abstractions and unit test contracts rather than live cloud traffic.

## 5. Remaining risk & next step

- Execute `dotnet test Showcase.slnx` in a terminal with appropriate permissions to confirm that all 51 unit and integration tests pass with 0 failures.
- All functional requirements R1-R4, acceptance criteria, compiler zero-warning/zero-error constraints, and edge cases are resolved and code-complete.
</prior_attempt>

<additional_context>
Open Issues Ledger:
- Verification of test suite execution (dotnet test) across all 51 tests needs confirmation [r3]
- Live HTTP requests against Cloudflare R2 endpoints (AWSSDK was verified via mocked S3 client for presigned URL and deletion calls) [r1]
- Live PostgreSQL database operations (tested DI container registration and DbContext options binding, but did not execute actual migrations against a running PostgreSQL server) [r1]
- Shallow Verification — Direct upload to Cloudflare R2 bucket has only been verified via unit tests against the S3 request constructor, not against an active Cloudflare R2 account [r1]
- Minor Robustness Risk — Live Cloudflare R2 network operations are simulated via AWS SDK abstractions and unit test contracts rather than live cloud traffic [r3]
- Untested Edge Cases — Direct HTTP PUT upload from a browser to the generated Cloudflare R2 presigned URL verifying CORS and header consistency (Content-Type) [r1]
- Untested Edge Cases — Concurrent refresh token rotation race conditions when multiple parallel client requests exchange the same refresh token [r1]
</additional_context>
