# Changelog: Profile Career, Verification & Moderation Model

## 1. Overview
Implemented the Domain model defined in `docs/DOMAIN_MODEL_DESIGN_REPORT.md`: a unified `Name` on `Profile`, optional account email, seven new career/visibility entities, three new moderation enums, a `DateRange` value object, and a rewritten `Profile` aggregate with verification and moderation behaviour. The EF Core mappings, Identity/JWT layer, and the Application-layer query surface were updated to match.

Scope was Domain + Infrastructure plus the unavoidable Application ripple. No API endpoint contracts and no frontend code were changed. No CQRS features were added for the new entities — the report deferred them.

## 2. Decisions Taken

| Decision | Choice | Why |
|---|---|---|
| Name fields | `FirstName` + `LastName` collapsed into `Name` (max 150) | Report requires one display name; splitting it again forces every read model to re-join |
| Email | Optional on the account; `RequireUniqueEmail(false)` | Report makes email optional; requiring uniqueness would make a second email-less signup impossible |
| JWT email claims | Emitted only when the account has an email; `preferred_username` always present | `email` is a non-nullable claim in the spec; a null value would break strict JWT consumers |
| Soft delete / ban visibility | Inline filters in the three public queries, **not** an EF global query filter | Decided with the user: a global filter would also hide a banned user's profile from `GetMyProfile`, so the owner could never see why they were banned |
| `Post.LikesCount` / `Post.Tags` | Not added | Explicitly deferred by the report |
| Date storage | `DateOnly` | Date ranges are calendar dates; a time component adds nothing and breaks inclusive month-end reasoning |

## 3. Changes Implemented

### A. Domain (new files)
- `Showcase.Domain/Enums/VerificationStatus.cs` — `None`, `Pending`, `Verified`, `Rejected`.
- `Showcase.Domain/Enums/FeaturedStatus.cs` — `None`, `Pending`, `Featured`, `Rejected`.
- `Showcase.Domain/Enums/LanguageProficiency.cs` — `Basic` → `Native`.
- `Showcase.Domain/ValueObjects/DateRange.cs` — parses `yyyy-MM` and `yyyy-MM-dd` (tolerating an ISO time suffix), rejects `End < Start`, exposes `IsCurrent` when `End` is null.
- Seven entities, each with its own folder matching the existing convention:
  `Experience`, `Academic`, `Skill`, `Credential`, `Language`, `Achievement`, `CareerVisibility`.

### B. Domain (modified)
- `Showcase.Domain/Entities/Profile/Profile.cs` — rewritten. New: `Name`, `Specialty`, `Country`, `IsVerified`, `VerificationStatus`, `FeaturedStatus`, `IsBanned`, `BanReason`, `BannedAtUtc`, `IsDeleted`, `DeletedAtUtc`, `CareerVisibility`. New behaviour: `Ban`, `Unban`, `SoftDelete`, `Restore`, `RequestVerification`, `MarkVerified`, `RejectVerification`, `SetFeaturedStatus`, `UpdateVisibility`. Collections for the seven new entities are exposed as `IReadOnlyCollection<T>` and mutated only through `Add*` methods.
- `Showcase.Domain/Entities/Profile/ProfileErrors.cs` — new guard failures for the verification and featured transitions.
- `Showcase.Domain/ValueObjects/Bio.cs` — `MaxLength` 500 → 1000 to match the report.

### C. Infrastructure (new files)
Seven EF configurations under `Showcase.Infrastructure/Data/Configurations/`: `ExperienceConfiguration`, `AcademicConfiguration`, `SkillConfiguration`, `CredentialConfiguration`, `LanguageConfiguration`, `AchievementConfiguration`, `CareerVisibilityConfiguration`. `DateRange` is mapped with `OwnsOne` inside each owning table. Table names follow the existing convention (pluralised type name — no `ToTable` anywhere in the project).

### D. Infrastructure (modified)
- `ProfileConfiguration.cs` — new columns, `IsVerified` / `IsBanned` / `IsDeleted` defaulting to `false`, the two enum conversions, and the one-to-one `CareerVisibility` relation.
- `ApplicationUserConfiguration.cs` — `IsBanned` / `BanReason` / `BannedAtUtc` / `IsDeleted` / `DeletedAtUtc`; email length and uniqueness left to `RequireUniqueEmail(false)`.
- `Identity/ApplicationUser.cs` — added the same moderation properties.
- `Identity/TokenService.cs` — `GenerateAccessToken` now takes `username` and emits `unique_name` + `preferred_username`; the `email` claim pair is conditional.
- `Identity/IdentityService.cs` — registration accepts a null email; `AuthenticateAsync` and `ValidateRefreshTokenAsync` reject banned and soft-deleted accounts with `Auth.AccountBanned` / `Auth.AccountDeleted`.
- `DependencyInjection.cs` — `RequireUniqueEmail` → `false`.

### E. Application (forced ripple — 19 files)
- `ITokenService`, `IIdentityService`, `UserIdentityDetails.Email` → `string?`.
- `RegisterCommand` → `(Username, Password, Name, Email?)`; validator now only checks email format when supplied.
- `LoginCommandHandler`, `RefreshTokenCommandHandler` — pass the username into token generation.
- `CurrentUserResponse` — `Name` replaces the name pair; added `IsVerified`, `IsBanned`, `BanReason`.
- `ProfileResponses`, `PostDtos` — `Name` on profile and creator DTOs; `Specialty` / `Country` on profile responses.
- `UpdateProfileCommand(+Validator,+Handler)`, `GetMyProfileQueryHandler`, `GetPublicProfileQueryHandler` — adapted to the new fields.
- `GetExplorePostsQueryHandler`, `GetProfilePostsQueryHandler` — hide banned and soft-deleted creators.

## 4. Manual Migration Required (deliberately not generated)
No file under `Showcase.Infrastructure/Migrations/` was created or modified, and `dotnet ef` was never run. **The database is currently out of sync with the model and the API will fail at runtime until a migration is written.** The hand-written migration needs to cover:

- `Profiles`: drop `FirstName` / `LastName`; add `Name` (required, 150) — backfill as `FirstName || ' ' || LastName` first — plus `Specialty`, `Country`, `IsVerified`, `VerificationStatus`, `FeaturedStatus`, `IsBanned`, `BanReason`, `BannedAtUtc`, `IsDeleted`, `DeletedAtUtc`, `Bio.Value` widened to 1000.
- New tables: `Experiences`, `Academics`, `Skills`, `Credentials`, `Languages`, `Achievements`, `CareerVisibilities` (each with its `DateRange` columns), and the `CareerVisibility` one-to-one key on `Profiles`.
- `AspNetUsers`: make `Email` nullable; add the five moderation columns. The `Users` unique index on `Email` must be dropped, otherwise the second email-less account cannot be inserted.

## 5. Verification
- `dotnet build Showcase.Domain/Showcase.Domain.csproj` — 0 warnings, 0 errors.
- `dotnet build Showcase.slnx` — **0 warnings, 0 errors** (includes the test project compiling).
- **No tests were run.** This was an explicit user instruction. Test files were updated *only* so the solution would compile: renamed `FirstName`/`LastName` assertions, reordered the `RegisterCommand` constructor arguments, and added the `username` argument to `GenerateAccessToken` call sites in `AuthFeatureTests`, `ProfileFeatureTests`, and `TokenServiceTests`. No new test cases were added — new test methods written earlier in this task were removed on request.

### Not verified
- The EF model has never been built against a real database, so the `OwnsOne` mappings, the `text[]` array columns, and the `CareerVisibility` one-to-one relation are **unproven at runtime**.
- No test asserts the new ban / soft-delete / optional-email behaviour. If you want that safety net, the deleted test methods in `ProfileFeatureTests` are the natural starting point.

## 6. Alternatives Rejected
- **Adding a `Profile` navigation property to `Post`** so the ban filter could read `!p.Profile.IsBanned`. The report models `Post` with a `ProfileId` only, and adding a navigation would change the aggregate shape. `GetExplorePostsQueryHandler` instead filters with a subquery over `_context.Profiles`, which keeps the predicate inside SQL — filtering after loading the page would silently break `TotalCount` and pagination.
- **A global EF query filter** for `!IsBanned && !IsDeleted`. Rejected because it would also hide the profile from the banned owner in `GetMyProfile`.
- **A new `AuthErrors` constants file** under `Features/Auth/Common/`. The existing `IdentityService` already returns inline `Error.Conflict("Auth.EmailTaken", ...)` calls throughout, so a constants file would be unused and inconsistent with the surrounding style.
