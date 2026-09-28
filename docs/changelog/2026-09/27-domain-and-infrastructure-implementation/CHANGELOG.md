# Changelog: Domain & Infrastructure Layer Implementation

## Decision & Context
Completed the full implementation and alignment of both `Showcase.Domain` and `Showcase.Infrastructure` layers for Pority web presence platform, supporting tags, interactions, live notifications, verification/featured requests, and local development fallback storage.

## Key Changes
1. **Showcase.Domain**:
   - `Tag` & `PostTag`: Normalized tag storage and many-to-many relationship with `Post`.
   - `PostLike`: Track likes without self-likes and debounce support.
   - `ProfileVisit`: 24-hour rate-limited visit logging with hashed IP and optional visitor token.
   - `Notification` & `NotificationType`: Domain entity for user alerts (like, visit, verification, featured, system).
   - `VerificationRequest` & `FeaturedRequest`: Administrative review workflows with approval and rejection state transitions.
   - `Post`: Added `LikesCount` and `PostTags` navigation collection with domain behavior methods (`AddTag`, `RemoveTag`, `IncrementLikes`, `DecrementLikes`).

2. **Showcase.Infrastructure**:
   - EF Core Configurations created: `TagConfiguration`, `PostTagConfiguration`, `PostLikeConfiguration`, `ProfileVisitConfiguration`, `NotificationConfiguration`, `VerificationRequestConfiguration`, `FeaturedRequestConfiguration`.
   - Fixed child navigation duplication across career configurations (`SkillConfiguration`, `AcademicConfiguration`, `AchievementConfiguration`, `CredentialConfiguration`, `ExperienceConfiguration`, `LanguageConfiguration`) to eliminate shadow foreign keys.
   - `ApplicationDbContext`: Registered explicit `DbSet` properties for all new entities and career aggregates. Applied Global Query Filter on `Profile` (`!IsDeleted && !IsBanned`).
   - `LocalStorageService`: Implemented local fallback storage service saving static files to `wwwroot/uploads` for local development when Cloudflare R2 is unconfigured.
   - `NotificationHub`: Created SignalR Hub with JWT query-string token authentication (`/hubs`).
   - `DependencyInjection`: Dynamically resolves `CloudflareR2StorageService` vs `LocalStorageService` based on environment configuration; registered SignalR and JWT hub authentication events.
   - EF Core Migration: Generated `20260927161621_AddDomainAndInfrastructureEntities`.

## Verification Results
- `dotnet build`: Succeeded with 0 warnings and 0 errors across the solution.
- `dotnet test`: 176 passed, 0 failed, 0 skipped (100% test pass rate).

## Architectural Divergence from Frontend & Owner's Strategic Rationale
1. **Single Full `Name` instead of `FirstName` / `LastName`**: Accommodates creative pseudonyms, single names, and studio brands; simplifies user onboarding and form interactions.
2. **Optional `Email` with Primary `Username`**: Lowers onboarding friction and aligns with creator platform norms where unique `@handle` is the primary identity.
3. **Optional `Country` and `Specialty` (Frontend update deferred)**: Prepares the backend database schema in advance; frontend UI forms will be updated later when structured JSON/reference datasets for countries and standardized specializations are integrated into dropdown selectors.
4. **Normalized `Tag` and `PostTag` Tables**: Replaces raw text arrays with relational entities and `NormalizedName` indexing to power future community features, tag discovery, and trending feeds.
5. **Distinct `IsBanned` vs `IsDeleted`**: Enforces strict separation between user-initiated soft-deletion and administrative suspension, allowing forbidden login responses to supply clear suspension reasons to the user.

## Update: Domain Alignment & Reference Datasets Integration
- **`VerificationRequest`**: Added `Category`, `IdentificationNumber`, `WebsiteUrl`, `PortfolioUrl`, and `DocumentUrl` to accurately match React frontend verification screen fields.
- **`Experience`**: Added optional `EmploymentType` and `Location`.
- **`Academic`**: Added optional `Location` and `Description`.
- **Reference Datasets**: Added `Country` (249 entries from `countries.json`) and `LanguageReference` (184 entries from `languages.json`) reference entities with `DatabaseSeeder` embedded resource loader and EF Core configurations.
- **EF Core Migration**: Migration deferred to a later stage per user instructions.
- **Verification**: `dotnet build` succeeded (0 warnings, 0 errors); `dotnet test` passed 192/192 tests (100% success rate).


