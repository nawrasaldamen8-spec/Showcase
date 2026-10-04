# Backend Clean Architecture Refactoring

## Overview
Comprehensive architectural refactoring of the Showcase ASP.NET Core backend to enforce Clean Architecture, eliminate N+1 queries in admin views, split monolithic files, and decouple business logic from HTTP endpoints while maintaining 100% test compatibility and frontend API contract integrity.

## Key Changes Completed

### Phase 1 & 2
- **Change 7**: Documented named constants (`ApproximateBytesPerPost = 850_000L`, `ApproximateBytesPerAvatar = 250_000L`) in `GetUsers.cs` and `GetStorageTelemetry.cs`.
- **Change 4**: Standardized Career features structure (`Career/Queries` -> `Career/Summary`) with backward compatibility facade for existing test suites.
- **Change 3**: Split `NotificationEvents.cs` (175 lines) into cohesive single-purpose files (`PostLikedEvent.cs`, `VerificationEvents.cs`, `FeaturedEvents.cs`, and `NotificationEventHandlers.cs`).
- **Change 5**: Added `GetProfileWithCareerDataAsync` to `ProfileQueryExtensions.cs` to eliminate duplicate query chains across handlers.
- **Change 11**: Enriched `Profile.AddExperience` and `Experience` constructor in Domain to accept `skillsUsed` directly, simplifying `CreateExperienceCommandHandler`.

### Phase 3
- **Change 1**: Eliminated N+1 identity and profile queries across Admin handlers:
  - `GetUsers.cs`: Batch user lookup using `IIdentityService.GetUsersByIdsAsync`.
  - `GetFeaturedRecommendations.cs`: Batch user identity, profile, and post count lookups.
  - `GetStorageTelemetry.cs`: Batch user lookup for top consumers and fallback accounts.

### Phase 4
- **Change 2**: Refactored monolithic `AddInfrastructure()` into private cohesive methods (`AddDatabase`, `AddJwtAuthentication`, `AddApplicationServices`, `AddInfrastructureHealthChecks`).
- **Change 6**: Added runtime conditional guard (503 Service Unavailable) in `LocalUpload.cs` when active storage provider is not `LocalStorageService`.
- **Change 8**: Extracted OAuth business logic from `GoogleCallback.cs` into `HandleGoogleCallbackCommand` + Handler in Application layer, leaving endpoint responsible only for HTTP cookies and redirect responses.
- **Change 9**: Decoupled `dev-toggle-ban` endpoint from `GetCurrentUser.cs` into dedicated `ToggleDevBanCommand` + handler and independent endpoint file `DevToggleBan.cs`.
- **Change 10**: Moved `UnreadCountResponse` to `NotificationDtos.cs` in Application layer and standardized `GetUnreadNotificationsCount` endpoint to use `.ToResponse()`.

### Phase 5 (Auth & Analytics Endpoints Cleanup)
- **Analytics IP Abstraction**: Added `IpAddress` property to `ICurrentUserService` and resolved client remote IP in `CurrentUserService` via `IHttpContextAccessor`. Cleaned `TrackProfileVisit` endpoint from direct `HttpContext` dependencies and moved SHA256 hashing to `TrackProfileVisitCommandHandler`.
- **Auth Cookie Helpers**: Enriched `AuthCookieHelper.cs` with `SetAuthCookies`, `ClearAuthCookies`, `GetAccessTokenCookie`, and `GetRefreshTokenCookie` extension methods, eliminating duplicated cookie manipulation across 8 endpoints.
- **Google OAuth Login URL Generation**: Extracted Google OAuth URL construction from `GoogleLogin.cs` into `GetGoogleAuthUrlQuery` + Handler in Application layer, removing Infrastructure dependencies from `GoogleLogin.cs`.
- **Auth Endpoints Cleanup**: Streamlined `ChangeUsername.cs`, `ChangePassword.cs`, `Login.cs`, `Register.cs`, `RegisterGoogle.cs`, `RefreshToken.cs`, `Logout.cs`, and `GoogleCallback.cs` to standard clean Minimal API endpoints.
- **Storage LocalUpload Cleanup**: Extracted local file stream persistence from `LocalUpload.cs` into `UploadLocalFileCommand` + Handler in Application and added `SaveAsync` to `IStorageService`, turning `LocalUpload.cs` into an ultra-thin 2-line endpoint.

### Phase 6 (Broadcast Feature Removal)
- Removed obsolete Broadcast endpoints (`CreateBroadcast.cs`, `GetBroadcasts.cs`) and feature handlers.
- Cleaned `AdminDashboardMetricsDto` and `GetDashboardMetrics.cs` to remove unused `RecentBroadcasts`.
- Removed dead `BroadcastAsync` signature and SignalR implementation from `IRealtimeNotifier` and `SignalRRealtimeNotifier`.
- Cleaned test suite in `AdminFeatureTests.cs`.
### Phase 7 (Audit Logging & Mock Data Cleanup)
- **Audit Logging Refactoring**: Enriched `IAuditLogger` and `AuditLogger` with automatic current admin context resolution (`_currentUserService.UserId` and `_currentUserService.Username`), eliminating boilerplate and removing redundant `ICurrentUserService` dependencies across 10 Admin command handlers (`ApproveFeaturedRequest`, `RejectFeaturedRequest`, `ToggleCuratedPin`, `DismissReport`, `ResolveReport`, `BanUser`, `ToggleUserVerification`, `UnbanUser`, `ApproveVerificationRequest`, `RejectVerificationRequest`).
- **Mock Data Elimination**: Removed hardcoded fake audit log fallback in `GetAuditLogs.cs`, fake storage consumer profiles in `GetStorageTelemetry.cs`, and sample notifications from `DatabaseSeeder.cs`.

### Phase 8 (Content Report Event-Driven Decoupling)
- **Event-Driven Architecture for Reports**: Extracted moderation warning notification logic from `ResolveReportCommandHandler` into `ContentReportResolvedNotificationEvent` and handled in `NotificationEventHandlers`.
- **SignalR Realtime Integration**: Added real-time notification push (`_realtimeNotifier.PublishToUserAsync`) for moderation notices when reports are resolved.
- **Handler Simplification**: Reduced `ResolveReportCommandHandler` from 115 lines of cross-aggregate querying down to a single-purpose 30-line handler.

### Phase 9 (Admin Users DDD Query Extensions & N+1 Elimination)
- **Domain Query Extensions**: Added reusable `Search(term)` and `FilterByStatus(status)` IQueryable extensions in `ProfileQueryExtensions.cs`, encapsulating search criteria and status filtering across all profile and admin queries.
- **N+1 Post Count Elimination**: Resolved N+1 query issue in `GetUsersQueryHandler` by pre-aggregating post counts in a single `GroupBy` query.
- **LINQ Projection Pipeline**: Replaced imperative `foreach` and `list.Add` with clean functional LINQ projection and in-memory role filtering.

### Phase 10 (Verification Flow DDD Event-Driven Decoupling)
- **Decoupled Verification Lifecycle**: Moved pending `VerificationRequest` resolution into `VerificationApprovedNotificationEvent` and `VerificationRejectedNotificationEvent` event handlers, removing cross-aggregate querying from `ToggleUserVerificationCommandHandler`.
- **Domain Errors & Single Flow**: Standardized `ToggleUserVerificationCommandHandler` to use `ProfileErrors.NotFoundForUser` and streamlined the handler execution to single-purpose Profile state change and event dispatching.

### Phase 11 (UpdateUserRole DDD Refactoring & Domain Constants)
- **Domain Role Constants & Error Types**: Introduced `AppRoles` constants (`AppRoles.Admin`, `AppRoles.User`) and `AdminErrors` (`PasswordRequired`, `InvalidPassword`) in the Domain layer.
- **Security Policy Encapsulation**: Extracted step-up authentication and administrative privilege verification into `ValidateAdminPrivilegeChangeAsync`, separating security policy enforcement from the core role update flow in `UpdateUserRoleCommandHandler`.

### Phase 12 (Functional LINQ Projections & AsNoTracking Optimization)
- **Read Query Optimization**: Converted `GetVerificationRequestsQueryHandler` and `GetFeaturedRecommendationsQueryHandler` to use `.AsNoTracking()` for EF Core queries, eliminating change-tracking overhead.
- **Functional LINQ Mapping**: Replaced imperative `foreach` loops and manual `list.Add` calls with functional `requests.Select(...).ToList()` projections, making the query pipeline cleaner, immutable, and consistent with Clean Architecture practices.

### Phase 13 (Profile Visit Tracking Event-Driven Decoupling)
- **Domain Event Extraction**: Created `ProfileVisitedNotificationEvent` in `Showcase.Application/Features/Notifications/Events/ProfileEvents.cs`.
- **Side-Effect & Notification Decoupling**: Moved `Notification` creation and `IRealtimeNotifier` SignalR push into `NotificationEventHandlers.cs`, eliminating direct cross-aggregate coupling from `TrackProfileVisitCommandHandler`.
- **Handler Simplification & Encapsulation**: Refactored `TrackProfileVisitCommandHandler` to focus solely on recording visits with encapsulated deduplication checking (`IsDuplicateVisitAsync`) and IP hashing (`HashIp`), using `IPublisher` to broadcast events.

### Phase 14 (Google OAuth Infrastructure Decoupling)
- **External Auth Service Abstraction**: Extracted Google OAuth token exchange and OpenID Connect userinfo retrieval into `IGoogleAuthService` interface in Application and `GoogleAuthService` in Infrastructure.
- **Handler Simplification**: Reduced `HandleGoogleCallbackCommandHandler` from 159 lines of low-level HTTP client and JSON parsing boilerplate down to 80 lines of clean orchestration and encapsulated URL formatting.

### Phase 15 (Auth Session Orchestrator Refactoring)
- **Session Lifecycle Orchestrator**: Introduced `IAuthSessionOrchestrator` in Application and `AuthSessionOrchestrator` in Infrastructure to encapsulate session creation (`CreateSessionAsync`) and session refresh (`RefreshSessionAsync`), eliminating duplicated token generation, refresh token persistence, and cookie writing across `Login`, `Register`, `RegisterGoogle`, and `RefreshToken`.
- **Command Handlers Streamlining**: Reduced `LoginCommandHandler`, `RegisterCommandHandler`, `RegisterGoogleCommandHandler`, and `RefreshTokenCommandHandler` down to minimal single-responsibility handlers.

### Phase 16 (Career Section Visibility DDD Encapsulation)
- **Domain Encapsulation**: Added `ToggleSection(section, isVisible)` to `CareerVisibility` entity and `ToggleCareerSection(section, isVisible)` to `Profile` Aggregate Root, moving switch logic and section validation into the domain.
- **Application Handler Decoupling**: Replaced manual 6-variable unpacking and re-packing in `ToggleSectionVisibilityCommandHandler` with a clean call to `profile.ToggleCareerSection(request.Section, request.IsVisible)`.

### Phase 17 (Notification Event Handlers Decomposition & Slicing)
- **Eliminated Monolithic God Class**: Deleted monolithic 244-line `NotificationEventHandlers.cs` implementing 7 MediatR interfaces across multiple domains.
- **Dedicated Slices**: Created single-responsibility handler files under `Showcase.Application/Features/Notifications/Handlers/`:
  - `PostLikedNotificationHandler.cs`
  - `ProfileVisitedNotificationHandler.cs`
  - `VerificationNotificationHandlers.cs` (`VerificationApprovedNotificationHandler`, `VerificationRejectedNotificationHandler`)
  - `FeaturedNotificationHandlers.cs` (`FeaturedApprovedNotificationHandler`, `FeaturedRejectedNotificationHandler`)
  - `ContentReportResolvedNotificationHandler.cs`
- **Notification Persistence Helper**: Created `NotificationPublishExtensions.cs` to encapsulate saving and pushing notifications via `IRealtimeNotifier`.

### Phase 18 (Post Creation & Update N+1 Query Elimination & Tag Batching)
- **Eliminated N+1 Tag Queries**: Created `PostTaggingExtensions.AttachTagsAsync` to batch query existing tags in a single SQL query and bulk-attach normalized tags.
- **Value Object & Profile Extensions Integration**: Refactored `CreatePostCommandHandler` and `UpdatePostCommandHandler` to use `Url.CreateOptional(...)` and `GetActiveProfileByUserIdAsync(...)`.

### Phase 19 (Post Deletion Event-Driven Decoupling & Parallel Asset Cleanup)
- **Decoupled Side-Effects from Database Transaction**: Extracted storage asset deletion and orphaned notification cleanup out of `DeletePostCommandHandler` into `PostDeletedNotificationEvent`.
- **Parallel Storage Deletion**: Created `PostDeletedNotificationHandler` which runs asset deletions concurrently via `Task.WhenAll` with error isolation, eliminating sequential network I/O blocking.
- **Handler Streamlining**: Reduced `DeletePostCommandHandler` to single-responsibility post lookup, ownership validation, database entity removal, and event dispatching via `GetActiveProfileByUserIdAsync` and `IPublisher`.

### Phase 20 (StorageKey DDD Encapsulation & MIME Mapping)
- **Domain ValueObject Factory Methods**: Added `StorageKey.ForPostImage(userId, postId, contentType)`, `StorageKey.ForAvatar(userId, contentType)`, and `StorageKey.GetExtensionForContentType(contentType)` to `StorageKey` ValueObject.
- **Eliminated Imperative MIME Switch**: Removed repeated inline `switch` statements and string format templates across `GetPostImageUploadUrlCommandHandler` and `GetAvatarUploadUrlCommandHandler`, encapsulating file extension resolution and storage URI paths entirely in the Domain layer.
- **Handler Streamlining**: Refactored `GetPostImageUploadUrlCommandHandler` with `GetActiveProfileByUserIdAsync` and `StorageKey.ForPostImage`.

### Phase 21 (ToggleLikePost DDD State Transition & Branch Elimination)
- **Declarative State Transition**: Eliminated 4-level deep nested conditional blocks and duplicated database/domain mutation branches by computing target state `var shouldBeLiked = request.DesiredState ?? !isCurrentlyLiked;`.
- **Idempotency Guarantee**: Unified early-return logic for no-op state requests (`shouldBeLiked == isCurrentlyLiked`).
- **Targeted Unit Tests**: Added unit tests in `PostFeatureTests.cs` covering toggle on, toggle off, idempotency, and notification event publishing.

### Phase 22 (Post Queries Performance Optimization & DDD Extension Pipeline)
- **Eliminated Change Tracking Overhead**: Added `.AsNoTracking()` across `GetExplorePostsQueryHandler`, `GetProfilePostsQueryHandler`, `GetMyPostsQueryHandler`, and `GetPostByIdQueryHandler`.
- **Created PostQueryExtensions**: Encapsulated query domain specifications (`AsPublished`, `Search`, `GetExploreFeaturedCreatorIds`, `GetUserLikedPostIdsAsync`, `GetPostCreatorsAsync`, and `ToSummaryResponse`), eliminating duplicated mapping and N+1 user resolution loops.
- **Handler Shrinkage**: Reduced `GetExplorePostsQueryHandler` from 147 lines down to 50 lines of clean pipeline orchestration.

### Phase 23 (Profile Queries Modernization & Functional Projections)
- **Profile Query Extensions Enrichment**: Added `WhereActive()`, `WhereFeatured(bool?)`, `GetUserIdentitiesAsync(userIds)`, `ToPublicResponse(username, storageService)`, and `ToMyProfileResponse(user, storageService)` to `ProfileQueryExtensions.cs`.
- **Eliminated N+1 Fallbacks & Change Tracking**: Added `.AsNoTracking()` and encapsulated batch user lookup across `GetProfilesQueryHandler`, `GetPublicProfileQueryHandler`, and `GetMyProfileQueryHandler`.
- **Handler Streamlining**: Replaced imperative `foreach` and `list.Add` loops with functional LINQ projections, cutting `GetProfilesQueryHandler` from 104 lines to 50 lines.

### Phase 24 (Zero-Tuple Pagination Modernization & PaginationRequest)
- **Standardized Pagination Contracts**: Introduced `IPaginationRequest` and `PaginationRequest` record in `Showcase.Application/Common/Models/PaginationRequest.cs` with defensive page and pageSize clamping.
- **Unified Pagination Extensions**: Created `PaginationExtensions.cs` providing `ApplyPaging`, `ToPaginatedListAsync`, and Linq projection helpers on `IQueryable<T>`.
- **Enriched PaginatedList**: Added `.Map<TResult>(...)` and `.Empty(...)` factory methods to `PaginatedList<T>`, completely eliminating raw tuples, manual metadata re-packing, and duplicate pagination models across the app.
- **Modernized Query Handlers**: Refactored `GetExplorePostsQueryHandler`, `GetProfilePostsQueryHandler`, `GetMyPostsQueryHandler`, `GetProfilesQueryHandler`, and `GetNotificationsQueryHandler` to use `ToPaginatedListAsync(request, ct)` and `.Map(...)`.
- **Unit Testing**: Added dedicated test suite `PaginationTests.cs` in `Showcase.Infrastructure.Tests`.

### Phase 25 (Database Transaction Boundaries & Cross-Aggregate Atomicity)
- **Transaction Abstraction**: Added `BeginTransactionAsync(CancellationToken)` to `IApplicationDbContext`.
- **Test-Safe Null Transaction**: Created `NullDbContextTransaction` implementing `IDbContextTransaction` for `UseInMemoryDatabase()` and non-relational test fixtures, preventing `InvalidOperationException` during unit testing.
- **Relational Fallback**: Implemented `BeginTransactionAsync` in `ApplicationDbContext` with `Database.IsRelational()` guard check.
- **Cross-Boundary Handler Wrapping**: Wrapped multi-step operations (`RegisterCommandHandler`, `IdentityService.RegisterExternalUserAsync`, `IdentityService.GetOrCreateExternalUserAsync`, `IdentityService.UpdateUserRolesAsync`, `BanUserCommandHandler`, `UnbanUserCommandHandler`) in explicit `await using var transaction = await _context.BeginTransactionAsync(ct);` and `await transaction.CommitAsync(ct);`.
- **Unit Testing**: Added `TransactionTests.cs` in `Showcase.Infrastructure.Tests`.

### Phase 26 (MediatR Cross-Cutting Pipeline Behaviors)
- **Unhandled Exception Interceptor**: Created `UnhandledExceptionBehavior<TRequest, TResponse>` in `Showcase.Application/Common/Behaviors/UnhandledExceptionBehavior.cs` to trap unexpected errors, log structured diagnostics, and convert them seamlessly into `Result.Failure(Error.Failure(...))` without breaking the request lifecycle.
- **Performance & Slow Request Telemetry**: Created `PerformanceBehavior<TRequest, TResponse>` in `Showcase.Application/Common/Behaviors/PerformanceBehavior.cs` to monitor request durations and log warnings with user ID when execution exceeds 500ms.
- **Pipeline Execution Ordering**: Registered `UnhandledExceptionBehavior` and `PerformanceBehavior` in `DependencyInjection.cs` before `LoggingBehavior` and `ValidationBehavior`.
- **Unit Testing**: Added `PipelineBehaviorTests.cs` in `Showcase.Infrastructure.Tests` covering exception translation, generic `Result<T>` mapping, pass-through, and performance tracking.

### Phase 28 (ISCED-F 2013 Classification Specialties Integration & Custom Cache Expirations)
- **Cache Duration Adjustments**: Updated cache TTLs based on business requirements:
  - `GetCountriesQuery`: 30 Days (`TimeSpan.FromDays(30)`)
  - `GetLanguagesQuery`: 30 Days (`TimeSpan.FromDays(30)`)
  - `GetPopularTagsQuery`: 3 Hours (`TimeSpan.FromHours(3)`)
  - `GetSpecialtiesQuery`: 30 Days (`TimeSpan.FromDays(30)`)
- **Dataset Ingestion & Seeding**: Processed official ISCED-F 2013 dataset (`classification-correspondence-table-311-en.json`), extracted 3,637 unique specialties categorized under 10 standard ISCED broad fields into `Showcase.Infrastructure/Data/Seed/specialties.json`.
- **Specialty Reference Domain Entity**: Created `SpecialtyReference` domain entity with `Name`, `Category`, `Code`, and `IsActive` properties under `Showcase.Domain/Entities/Lookup/`.
- **EF Core Configuration & DbContext**: Added `SpecialtyReferences` DbSet to `IApplicationDbContext` and `ApplicationDbContext`, with unique indexing in `SpecialtyReferenceConfiguration.cs`.
- **Automated Seeding**: Added `SeedSpecialtiesAsync` to `DatabaseSeeder.cs` with idempotent bulk ingestion and fallback defaults.
- **Lookup Query & Endpoint**: Implemented `GetSpecialtiesQuery` in `Showcase.Application/Features/Lookups/GetSpecialties.cs` implementing `ICachableQuery` (30 days TTL) and exposed `GET /api/lookups/specialties` endpoint in `Showcase.Api/Endpoints/Lookups/GetSpecialties.cs`.
- **Frontend Integration**: Added `getSpecialties()` in `Showcase.ClientApp/src/shared/api/apiClient.lookups.ts` and updated `SelectSpecialtyPage.tsx` with dynamic API fetching and search filtering.
- **Unit Testing**: Added `SpecialtyLookupTests.cs` covering seeding and caching query behavior.

### Phase 29 (Database Seeder Cleanup & Elimination of Dummy Accounts)
- **Removed Hardcoded Admin & Mock Profile**: Deleted hardcoded `admin` user account (`admin@showcase.com` / `Admin@123456`) and dummy `Profile` entity creation from `DatabaseSeeder.cs`, preventing hardcoded credentials and fake accounts from polluting the database.
- **Cleaned System Roles**: Replaced arbitrary role strings (`["Admin", "Member", "Moderator"]`) with domain constants `AppRoles.Admin` and `AppRoles.User` in `SeedRolesAsync`.
- **Decoupled Identity UserManager from Seeder**: Removed `UserManager<ApplicationUser>` dependency from `DatabaseSeeder.SeedAsync` and `Program.cs`, keeping `DatabaseSeeder` focused exclusively on reference data lookups (Countries, Languages, Specialties) and standard system roles.
- **Unit Testing**: Enhanced `ReferenceDataAndEntityTests.cs` to verify that seeding seeds all reference tables (Countries: 249, Languages: 184, Specialties: 3,637) while creating 0 dummy profiles.

### Phase 30 (Entity Framework Core Schema Migration)
- **Specialty References & Refresh Token Schema Migration**: Generated migration [`20261004165932_AddSpecialtyReferencesTable.cs`](file:///d:/Projects/AspFiles/Showcase/Showcase.Infrastructure/Migrations/20261004165932_AddSpecialtyReferencesTable.cs) creating the `SpecialtyReferences` table with primary key `Id`, columns (`Code`, `Name`, `Category`, `SubField`), and indexes on `Category` and `Name`.
- **Model Snapshot Sync**: Updated `ApplicationDbContextModelSnapshot.cs` to 100% reflect the current domain model with zero pending changes.

### Phase 31 (Domain Entities Folder Restructuring & DDD Aggregates Consolidation)
- **Consolidated Career Grouping (`Showcase.Domain/Entities/Career/`)**: Grouped all career-related entities into `Career/`: `Academic.cs`, `Achievement.cs`, `CareerVisibility.cs`, `Credential.cs`, `Experience.cs`, `Language.cs`, and `Skill.cs`.
- **Consolidated Profile Grouping (`Showcase.Domain/Entities/Profile/`)**: Grouped profile core and direct owned entities into `Profile/`: `Profile.cs`, `ProfileErrors.cs`, `ProfileVisit.cs`, `SocialLink.cs`, and `SocialLinkErrors.cs`.
- **Consolidated Post Grouping (`Showcase.Domain/Entities/Post/`)**: Grouped post aggregate, media, likes, and tagging into `Post/`: `Post.cs`, `PostErrors.cs`, `PostImage.cs`, `PostImageErrors.cs`, `PostLike.cs`, `PostLikeErrors.cs`, `PostTag.cs`, `Tag.cs`, and `TagErrors.cs`.
- **Consolidated Moderation & Governance Grouping (`Showcase.Domain/Entities/Moderation/`)**: Grouped governance, reports, verification, and audit logs into `Moderation/`: `ContentReport.cs`, `ContentReportErrors.cs`, `VerificationRequest.cs`, `VerificationRequestErrors.cs`, `FeaturedRequest.cs`, `FeaturedRequestErrors.cs`, and `AuditLog.cs`.
- **Lookups & Notifications Groupings**: Retained `Lookup/` (`Country.cs`, `LanguageReference.cs`, `SpecialtyReference.cs`) and `Notification/` (`Notification.cs`, `NotificationErrors.cs`).
- **Cleaned Empty Directories**: Deleted legacy single-entity flat directories and empty `Broadcast/` folder.

### Phase 32 (Application Vertical Slice Architecture Restructuring)
- **Standardized Vertical Slice Pattern**: Restructured all features in `Showcase.Application/Features/` so every operation is encapsulated in a single cohesive file containing its Command/Query record, FluentValidation validator, and MediatR request handler.
- **Eliminated Fragmented Directories**: Flattened over-nested, single-class subdirectories (`CreatePost/`, `UpdatePost/`, `GetPostById/`, etc.) across `Posts`, `Profiles`, `SocialLinks`, `Career`, `Auth`, `Lookups`, `Notifications`, and `Storage`.
- **Standardized Feature Directory Layout**:
  - `Features/<Feature>/Commands/`: Single file per command slice (e.g. `CreatePost.cs`, `UpdatePost.cs`).
  - `Features/<Feature>/Queries/`: Single file per query slice (e.g. `GetPostById.cs`, `GetExplorePosts.cs`).
  - `Features/<Feature>/Common/` or `<Feature>Dtos.cs`: Shared DTOs and mapping utilities.
- **Updated API Endpoints & Unit Tests Usings**: Updated all endpoint mappings in `Showcase.Api/Endpoints/` and test suites in `tests/Showcase.Infrastructure.Tests/` to reference the clean, consolidated namespaces with zero duplicate using warnings.

### Phase 33 (Infrastructure Configurations Folder Organization)
- **Consolidated Entity Configurations (`Showcase.Infrastructure/Data/Configurations/`)**: Grouped all 24 `IEntityTypeConfiguration<T>` files into matching domain folders mirroring `Domain/Entities/`:
  - `Career/`: Academic, Achievement, CareerVisibility, Credential, Experience, Language, Skill.
  - `Profile/`: Profile, ProfileVisit, SocialLink.
  - `Post/`: Post, PostImage, PostLike, PostTag, Tag.
  - `Moderation/`: ContentReport, VerificationRequest, FeaturedRequest, AuditLog.
  - `Lookup/`: Country, LanguageReference, SpecialtyReference.
  - `Notification/`: Notification.
  - `Identity/`: ApplicationUser.
- **Assembly Scanning**: Maintained `ApplyConfigurationsFromAssembly` in `ApplicationDbContext` with unified `Showcase.Infrastructure.Data.Configurations` namespace.

### Phase 34 (Infrastructure Identity Folder Organization)
- **Consolidated Identity Structure (`Showcase.Infrastructure/Identity/`)**: Grouped all identity and authentication files into dedicated functional subfolders:
  - `Models/`: `ApplicationUser.cs` (IdentityUser entity).
  - `Services/`: `IdentityService.cs` (user management, roles, passwords), `CurrentUserService.cs` (HttpContext claim resolution).
  - `Tokens/`: `TokenService.cs` (JWT signing and validation), `JwtSettings.cs` (options configuration).
  - `Cookies/`: `AuthCookieService.cs` (HttpOnly cookies), `AuthSessionOrchestrator.cs` (session lifecycle coordination).
  - `OAuth/`: `GoogleAuthService.cs` (OAuth provider integration), `GoogleAuthSettings.cs` (Google OAuth options).
- **Zero Regression**: Retained full compatibility with 0 code breaks and 100% test pass rate.

### Phase 35 (IdentityService Decomposition via Focused Partial Classes)
- **Decomposed Monolithic `IdentityService.cs`**: Split the 765-line `IdentityService` into 5 focused, cohesive partial classes under `Showcase.Infrastructure/Identity/Services/`:
  - `IdentityService.cs`: Core class definition, dependency injection constructor (`UserManager<ApplicationUser>`, `ApplicationDbContext`), and shared helper methods (`ToDetails`, `LooksLikeEmail`).
  - `IdentityService.Auth.cs`: Authentication and Refresh Token lifecycle (`AuthenticateAsync`, `ValidateRefreshTokenAsync`, `ValidateRefreshTokenDirectAsync`, `UpdateRefreshTokenAsync`, `RevokeRefreshTokenAsync`).
  - `IdentityService.Account.cs`: User account management and credentials (`RegisterUserAsync`, `GetUserByIdAsync`, `GetUserByUsernameAsync`, `GetUsersByIdsAsync`, `VerifyPasswordAsync`, `ChangePasswordAsync`, `ChangeEmailAsync`, `ChangeUsernameAsync`, `UpdatePhoneNumberAsync`).
  - `IdentityService.Roles.cs`: Role assignment and management (`UpdateUserRolesAsync`).
  - `IdentityService.External.cs`: Third-party OAuth integration (`GetExistingExternalUserAsync`, `RegisterExternalUserAsync`, `GetOrCreateExternalUserAsync`).
- **Zero Breaking Changes**: Preserved `IIdentityService` interface and method signatures with zero changes required in Application handlers or Dependency Injection.

### Phase 36 (Health Check Endpoints Extraction as IEndpoint)
- **Extracted Health Check Endpoints**: Created [`Showcase.Api/Endpoints/Health/HealthCheckEndpoints.cs`](file:///d:/Projects/AspFiles/Showcase/Showcase.Api/Endpoints/Health/HealthCheckEndpoints.cs) implementing `IEndpoint` with `/health/live` and `/health` routes, OpenAPI tags, and detailed JSON response formatting.
- **Cleaned `Program.cs`**: Removed 26 lines of inline `MapHealthChecks` configuration from `Program.cs`, reducing `Program.cs` to 63 lines of streamlined pipeline and startup setup automatically mapped via `app.MapEndpoints()`.

### Phase 37 (Database Initialization Encapsulation in DatabaseExtensions)
- **Extracted Database Seeding & Migration Pipeline**: Created [`Showcase.Api/DependencyInjection/DatabaseExtensions.cs`](file:///d:/Projects/AspFiles/Showcase/Showcase.Api/DependencyInjection/DatabaseExtensions.cs) encapsulating `app.Services.CreateScope()`, `DbContext.Database.MigrateAsync()`, and `DatabaseSeeder.SeedAsync()` into an asynchronous extension method `await app.InitialiseDatabaseAsync()`.
- **Streamlined `Program.cs` to 44 Lines**: Eliminated raw scope creation and error handling boilerplate from `Program.cs`, leaving a single declarative startup flow.

### Phase 38 (Global NoTracking Configuration & Query Cleanup)
- **Configured Global NoTracking in DbContext**: Added `options.UseQueryTrackingBehavior(QueryTrackingBehavior.NoTracking);` to `AddDatabase` in `DependencyInjection.cs`, setting all application queries to read-only no-tracking by default for maximum memory efficiency and performance.
- **Removed Repetitive `.AsNoTracking()` Calls**: Eliminated 32 redundant `.AsNoTracking()` calls across all queries and query extension methods in `Showcase.Application`.

## Verification
- `dotnet build Showcase.slnx -m:1`: Succeeded with 0 Warnings and 0 Errors.
- `dotnet test`: 206 / 206 Tests Passing (100% pass rate).
- `dotnet ef migrations has-pending-model-changes`: Succeeded with 0 pending changes.
- `npx tsc --noEmit` (Showcase.ClientApp): Succeeded with 0 TypeScript errors.














