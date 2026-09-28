# Pority — Backend Technical Design

> **Document type:** Technical design blueprint. Describes the target database shape, DTO contracts, feature modules, and the ASP.NET Core tooling.
> **This document designs — it does not implement.** No code, migration, or file outside this document was created or modified.
> **Grounded in:** the actual existing backend source (entities, EF configurations, migrations, DI, endpoints) and the frontend contracts documented in `PORITY_FRONTEND_SCREENS_AND_DATA.md`.
> **Requirements source:** `PORITY_BACKEND_REQUIREMENTS.md`.

---

## 1. Current State — What Already Exists

The backend is **partially built and follows a consistent, high-quality set of conventions.** This document extends those conventions rather than replacing them.

### 1.1 Solution layout

```
Showcase.slnx
├── Showcase.Domain          22 .cs   — entities, value objects, Result/Error
├── Showcase.Application    102 .cs   — MediatR vertical slices, interfaces
├── Showcase.Infrastructure  26 .cs   — EF Core, Identity, JWT, R2 storage
├── Showcase.Api             45 .cs   — minimal API endpoints, DI, Swagger
└── tests/                            — xUnit + Moq + EF InMemory
```

**Dependency rule (as built):** `Api → Application → Domain`, `Api → Infrastructure → Application`. `Domain` references nothing. This is correct Clean Architecture and should be preserved and enforced by a test.

### 1.2 What is implemented

| Area | Endpoints | Entities | Notes |
|---|---|---|---|
| Auth | 8 | `ApplicationUser` (Identity) | Register, login, logout, me, refresh, change password/email/username |
| Profiles | 7 | `Profile` | get mine/public, update, avatar upload/remove |
| Posts | 12 | `Post`, `PostImage` | CRUD, publish/unpublish, images, explore |
| Social links | 4 | `SocialLink` | CRUD + reorder |
| **Career** | 0 | 0 | Nothing |
| **Admin** | 0 | 0 | Nothing |
| **Likes** | 0 | 0 | Nothing |

### 1.3 Critical finding — the database has never been created

Two migrations exist, and the **second one is empty**:

| Migration | Size | Content |
|---|---|---|
| `20260918202846_InitialPostgreSql.cs` | 17 KB | Real schema: 6 Identity tables + `Profiles`, `Posts`, `SocialLinks`, `PostImages` |
| `20260921125644_InitialCreate.cs` | **467 B** | **Empty `Up()` and `Down()` — a stub** |

So the effective schema is the first migration: **4 domain tables.** Everything else in this document is greenfield.

**Action required before any new migration:** the empty `InitialCreate` must be resolved — either deleted (if the model snapshot is consistent with `InitialPostgreSql`) or regenerated. Applying migrations as-is will leave the model snapshot and migration history inconsistent, and future `dotnet ef migrations add` calls will produce a migration that tries to re-create existing tables or diff against a stale snapshot.

### 1.4 Existing schema (authoritative baseline)

From `20260918202846_InitialPostgreSql`. **Naming convention is PascalCase for both tables and columns** — no `UseSnakeCaseNamingConvention()` is applied. This document preserves that.

```sql
-- Identity (ASP.NET Identity, 6 tables)
AspNetUsers         Id text PK, RefreshToken varchar(500), RefreshTokenExpiryTime timestamptz,
                    + standard Identity columns
AspNetRoles         Id text PK, Name, NormalizedName (unique idx RoleNameIndex)
AspNetUserRoles     (UserId, RoleId) composite PK
AspNetUserClaims    Id int PK (identity), UserId, ClaimType, ClaimValue
AspNetRoleClaims    Id int PK (identity), RoleId, ClaimType, ClaimValue
AspNetUserLogins    (LoginProvider, ProviderKey) composite PK, UserId
AspNetUserTokens    (UserId, LoginProvider, Name) composite PK, Value

-- Domain (4 tables)
Profiles     Id uuid PK, UserId varchar(450) FK→AspNetUsers (UNIQUE idx),
             FirstName varchar(100), LastName varchar(100),
             Bio varchar(500) NULL, AvatarKey varchar(1000) NULL,
             CreatedAt timestamptz, UpdatedAt timestamptz NULL

Posts        Id uuid PK, ProfileId uuid FK→Profiles (CASCADE),
             Title varchar(200), Description varchar(4000),
             ExternalUrl varchar(2000) NULL,
             Status integer,                      -- HasConversion<int>()
             CreatedAt timestamptz, PublishedAt timestamptz NULL, UpdatedAt timestamptz NULL

SocialLinks  Id uuid PK, ProfileId uuid FK→Profiles (CASCADE),
             Platform varchar(100), Url varchar(2000),
             DisplayOrder integer DEFAULT 0

PostImages   Id uuid PK, PostId uuid FK→Posts (CASCADE),
             StorageKey varchar(1000), DisplayOrder integer, CreatedAt timestamptz

-- Existing indexes
IX_Profiles_UserId   (unique), IX_SocialLinks_ProfileId,
IX_Posts_ProfileId, IX_Posts_Status, IX_Posts_PublishedAt, IX_PostImages_PostId
```

**Value object mapping is established:** owned value objects (`Bio`, `ExternalUrl`, `Url`, `StorageKey`, `AvatarKey`) each flatten to **one** `varchar` column, not a JSON blob. This document keeps that.

**Type mapping is established:** `Guid` → `uuid`, `DateTime` → `timestamp with time zone`, `string(n)` → `character varying(n)`, Identity string keys → `text`.

### 1.5 Conventions to follow (as built, not invented)

These are observed in the source and are the house style:

| Concern | Established convention | Example |
|---|---|---|
| Entity base | `BaseEntity` with `protected set` on `Id` and a `Guid.NewGuid()` default ctor | `BaseEntity.cs` |
| Invariants | Private setters; behavior methods; no public setters | `Post.Publish()` |
| Return type | `Result` / `Result<T>` — **never exceptions** for expected failures | `Result.cs` |
| Errors | `record Error(Code, Description, ErrorType)` + named factories | `Error.cs` |
| Error mapping | `ErrorType` → HTTP status, centralized | `ResultExtensions.cs:21-30` |
| Value objects | `sealed record`, `private` ctor, `static Result<T> Create()`, `MaxLength` const, `CreateOptional()` | `Url.cs`, `Bio.cs` |
| EF ctor | `private X() { } // EF Core` | `Post.cs:23` |
| EF collections | `readonly List<T>` field + `IReadOnlyCollection<T>` property + `PropertyAccessMode.Field` | `PostConfiguration.cs:57-59` |
| EF config | `IEntityTypeConfiguration<T>` per entity in `Data/Configurations/`, auto-applied | `ApplyConfigurationsFromAssembly` |
| Slice layout | `Features/{Area}/{Commands\|Queries}/{UseCase}/` | — |
| Slice files | `{UseCase}Command.cs`, `{UseCase}CommandHandler.cs`, `{UseCase}CommandValidator.cs` | `CreatePost/` |
| Query result | `record` DTOs in `Features/{Area}/Common/{Area}Dtos.cs` | `PostDtos.cs` |
| Endpoint | `class X : IEndpoint` with `MapEndpoint`, `.WithTags/.WithName/.Produces*/.RequireAuthorization` | `PublishPost.cs` |
| Error surface | `result.ToResponse()` extension | `ResultExtensions.cs` |
| Interfaces | Application layer declares them; Infrastructure implements | `IStorageService`, `IIdentityService` |
| Handlers depend on | `IApplicationDbContext` + `ICurrentUserService` (+ `IIdentityService`, `IStorageService`) | `CreatePostCommandHandler.cs:18-19` |

**One deviation to fix:** handlers use **primary constructors with constructor injection**, not the DI'd `ValidateOnBuild` property-injection style MediatR used to support. This is fine — it works with MediatR 14. Keep it.

---

## 2. Database Design

### 2.1 Naming and type rules

| Rule | Value | Rationale |
|---|---|---|
| Table names | PascalCase plural (`Posts`, `CareerExperiences`) | Matches existing migration |
| Column names | PascalCase | Matches existing migration |
| Domain PK | `uuid` | Application-generated, no sequence needed |
| Identity PK/FK | `text` | ASP.NET Identity default |
| Enum storage | `integer` + `HasConversion<int>()` | Matches `PostConfiguration.cs:37` |
| Value objects | Flattened single `varchar` | Matches `Bio`, `Url`, `StorageKey` |
| Timestamps | `timestamptz` | UTC everywhere |
| Deletion | `CASCADE` for owned children | Matches existing |
| Indexes | `IX_{Table}_{Column}` | EF default, matches existing |
| Unique indexes | `{Name}Index` | Matches `UserNameIndex`, `EmailIndex` |

### 2.2 Changes to existing tables

#### `AspNetUsers` — add ban state

| Column | Type | Null | Notes |
|---|---|---|---|
| `IsBanned` | `boolean` | No | Default `false`. **Maps to frontend `isBanned`** |
| `BanReason` | `varchar(500)` | Yes | Maps to `banReason` |

`AspNetUsers.PhoneNumber` **already exists** (Identity standard column) and is currently unused. Map frontend `phoneNumber` here rather than adding a duplicate on `Profiles` — see 2.4.

`AccountNumber` has no home in Identity and no stated purpose. It is added to `Profiles` for contract completeness, but see the caution in 2.4.

#### `Profiles` — add 7 columns

| Column | Type | Null | Frontend field | Notes |
|---|---|---|---|---|
| `Specialty` | `varchar(200)` | Yes | `specialty` | Professional headline |
| `IsVerified` | `boolean` | No | `isVerified` | Default `false` |
| `VerificationStatus` | `integer` | No | `verificationStatus` | Default `0` (None) |
| `FeaturedStatus` | `integer` | No | `featuredStatus` | Default `0` (None) |
| `IsFeaturedPinned` | `boolean` | No | — (admin `isCuratedPinned`) | Default `false`. **Orthogonal to `FeaturedStatus`** |
| `AccountNumber` | `varchar(50)` | Yes | `accountNumber` | ⚠ see 2.4 |

**Not added to `Profiles`:** `username` and `email`. These live on `AspNetUsers` (`UserName`, `Email`). The frontend DTOs expose them by joining — which is what `GetPostByIdQueryHandler` already does via `IIdentityService.GetUserByIdAsync`. This avoids the denormalization the frontend `Profile` type suggests.

#### `Posts` — add tags and like count

| Column | Type | Null | Frontend field | Notes |
|---|---|---|---|---|
| `Tags` | `text[]` | No | `tags` | Default empty array. Max 10 enforced in the domain |
| `LikeCount` | `integer` | No | `likeCount` | Default `0`. Maintained aggregate |

**Why `text[]` and not a join table:** tags are unordered, capped at 10, and only ever filtered as "contains". A `text[]` column with a GIN index handles this with one column and no join. A `post_tags` table would only pay off if tags become first-class entities with their own pages, which the frontend does not have.

**Why `LikeCount` is a column:** it is read on every list query and would otherwise be a correlated aggregate on every row. It is a denormalized counter and must be updated in the same transaction as the like insert/delete — see the invariant in 4.3.

**Not stored:** `isLiked` (viewer-relative, resolved per request), `thumbnailUrl` and `imageCount` (derived).

### 2.3 New table — `PostLikes`

Required by `POST /api/posts/{id}/like`, which the frontend calls from `PostLikeButton` and which has no backend.

| Column | Type | Null | Notes |
|---|---|---|---|
| `Id` | `uuid` | No | PK |
| `PostId` | `uuid` | No | FK→`Posts`, `ON DELETE CASCADE` |
| `UserId` | `text` | No | FK→`AspNetUsers`, `ON DELETE CASCADE` |
| `CreatedAt` | `timestamptz` | No | |

| Index | Columns | Unique |
|---|---|---|
| `PK_PostLikes` | `Id` | Yes |
| `IX_PostLikes_PostId_UserId` | `PostId, UserId` | **Yes** — prevents double-liking |

The composite unique index is what makes the toggle safe against concurrent requests. It also serves the `isLiked` lookup by `(PostId, UserId)`.

### 2.4 New tables — Career (7)

All seven key to `Profile.Id` with `ON DELETE CASCADE`. All carry `Id uuid PK`, `ProfileId`, `CreatedAt timestamptz`. **No status column on any of them** — career records have no lifecycle.

**Date columns:** the frontend sends `YYYY-MM`. Store as PostgreSQL `date` holding the **first of the month** and serialize back to `YYYY-MM` in the DTO. This gives correct chronological ordering and range queries, which a `char(7)` string cannot do safely.

#### `CareerExperiences`

| Column | Type | Null | Notes |
|---|---|---|---|
| `Company` | `varchar(200)` | No | |
| `JobTitle` | `varchar(200)` | No | |
| `StartDate` | `date` | No | |
| `EndDate` | `date` | Yes | |
| `CurrentlyWorking` | `boolean` | No | Default `false`. Mutually exclusive with `EndDate` |
| `EmploymentType` | `varchar(50)` | Yes | Free text — see 2.9 |
| `Location` | `varchar(200)` | Yes | |
| `Description` | `text` | Yes | |
| `Achievements` | `text` | Yes | |
| `SkillsUsed` | `text[]` | No | Default empty array |

`IX_CareerExperiences_ProfileId` on `(ProfileId, StartDate DESC)`.

#### `CareerAcademics`

| Column | Type | Null | Notes |
|---|---|---|---|
| `Institution` | `varchar(200)` | No | |
| `Degree` | `varchar(200)` | No | |
| `FieldOfStudy` | `varchar(200)` | No | |
| `StartDate` | `date` | No | |
| `EndDate` | `date` | Yes | |
| `CurrentlyStudying` | `boolean` | No | Default `false` |
| `Location` | `varchar(200)` | Yes | |
| `Description` | `text` | Yes | |
| `Gpa` | `varchar(20)` | Yes | Free text — see 2.9 |
| `Achievements` | `text` | Yes | |

`IX_CareerAcademics_ProfileId` on `(ProfileId, StartDate DESC)`.

#### `CareerSkills`

| Column | Type | Null | Notes |
|---|---|---|---|
| `Name` | `varchar(100)` | No | |
| `Category` | `integer` | Yes | `SkillCategory` enum. Nullable because the frontend field is optional |

`IX_CareerSkills_ProfileId` on `ProfileId`, plus a plain index on `Name` for future lookup.

#### `CareerCredentials`

| Column | Type | Null | Notes |
|---|---|---|---|
| `Name` | `varchar(200)` | No | |
| `IssuingOrganization` | `varchar(200)` | No | |
| `IssueDate` | `date` | Yes | |
| `ExpirationDate` | `date` | Yes | |
| `CredentialId` | `varchar(200)` | Yes | The credential's own ID, not a DB key |
| `VerificationUrl` | `varchar(2000)` | Yes | Flattened `Url` value object |
| `MediaUrl` | `varchar(2000)` | Yes | ⚠ **plain URL, no upload flow exists** — see 2.8 |

`IX_CareerCredentials_ProfileId` on `ProfileId`.

#### `CareerLanguages`

| Column | Type | Null | Notes |
|---|---|---|---|
| `Language` | `varchar(100)` | No | |
| `Proficiency` | `integer` | No | `LanguageProficiency` enum |

`IX_CareerLanguages_ProfileId` on `ProfileId`. Consider `UNIQUE (ProfileId, Language)` to prevent duplicates.

#### `CareerAchievements`

| Column | Type | Null | Notes |
|---|---|---|---|
| `Title` | `varchar(200)` | No | |
| `Type` | `varchar(100)` | Yes | Free text — see 2.9 |
| `Date` | `date` | Yes | |
| `Organization` | `varchar(200)` | Yes | |
| `Description` | `text` | Yes | |
| `Url` | `varchar(2000)` | Yes | Flattened `Url` value object |
| `MediaUrl` | `varchar(2000)` | Yes | ⚠ see 2.8 |

`IX_CareerAchievements_ProfileId` on `(ProfileId, Date DESC)`.

#### `CareerVisibilitySettings`

One row per profile. `ProfileId` is both PK and FK.

| Column | Type | Default | Frontend field |
|---|---|---|---|
| `ProfileId` | `uuid` | — | — |
| `Experience` | `boolean` | `true` | `visibility.experience` |
| `Academics` | `boolean` | `true` | `visibility.academics` |
| `Skills` | `boolean` | `true` | `visibility.skills` |
| `Credentials` | `boolean` | `true` | `visibility.credentials` |
| `Languages` | `boolean` | `true` | `visibility.languages` |
| `Achievements` | `boolean` | `true` | `visibility.achievements` |

**Separate table rather than 6 columns on `Profiles`:** the `toggleSectionVisibility` endpoint returns the complete settings object, and a dedicated entity makes the invariant "exactly one row per profile" enforceable with the PK.

**Default is `true`** for all six — a career section the creator has never touched should be visible, matching the frontend default of showing content.

### 2.5 New tables — Moderation (4)

#### `VerificationRequests`

| Column | Type | Null | Notes |
|---|---|---|---|
| `Id` | `uuid` | No | PK |
| `ProfileId` | `uuid` | No | FK→`Profiles`, `CASCADE` |
| `Message` | `text` | Yes | |
| `Notes` | `text` | Yes | |
| `Category` | `varchar(100)` | Yes | |
| `IdentificationNumber` | `varchar(100)` | Yes | ⚠ **sensitive** — see 2.7 |
| `WebsiteUrl` | `varchar(2000)` | Yes | |
| `PortfolioUrl` | `varchar(2000)` | Yes | |
| `DocumentUrl` | `varchar(2000)` | Yes | |
| `Status` | `integer` | No | `0=Pending, 1=Approved, 2=Rejected` |
| `SubmittedAt` | `timestamptz` | No | |
| `DecisionNote` | `text` | Yes | |
| `DecidedByUserId` | `text` | Yes | FK→`AspNetUsers`, `SET NULL` |
| `DecidedAt` | `timestamptz` | Yes | |

Indexes: `(ProfileId, Status)`, `IX_VerificationRequests_Status` for the admin queue.

**Partial unique index** to enforce one pending request per profile:

```sql
CREATE UNIQUE INDEX "IX_VerificationRequests_PendingPerProfile"
    ON "VerificationRequests" ("ProfileId") WHERE "Status" = 0;
```

#### `FeaturedRequests`

| Column | Type | Null | Notes |
|---|---|---|---|
| `Id` | `uuid` | No | PK |
| `ProfileId` | `uuid` | No | FK→`Profiles`, `CASCADE` |
| `Message` | `text` | No | Required by `FeaturedRequestDto` |
| `Notes` | `text` | Yes | |
| `Status` | `integer` | No | `0=None, 1=Pending, 2=Featured, 3=Rejected` |
| `SubmittedAt` | `timestamptz` | No | |
| `DecidedByUserId` | `text` | Yes | FK→`AspNetUsers`, `SET NULL` |
| `DecidedAt` | `timestamptz` | Yes | |

⚠ The admin DTO `FeaturedRecommendationItem` has a `headline` field the submit type never sends. Add `Headline varchar(200) NULL` so the read model is satisfiable, and populate it in the mapping until the frontend sends a real value.

#### `ContentReports`

| Column | Type | Null | Notes |
|---|---|---|---|
| `Id` | `uuid` | No | PK |
| `ReporterUserId` | `text` | No | FK→`AspNetUsers`, `CASCADE` |
| `TargetType` | `integer` | No | `0=Post, 1=User` |
| `TargetId` | `uuid` | No | Polymorphic — **no FK constraint** |
| `Reason` | `integer` | No | `0..4` (copyright, impersonation, inappropriate, spam, other) |
| `Details` | `text` | No | |
| `Status` | `integer` | No | `0=Pending, 1=Resolved, 2=Dismissed` |
| `ActionTaken` | `text` | Yes | |
| `CreatedAt` | `timestamptz` | No | |
| `ResolvedByUserId` | `text` | Yes | FK→`AspNetUsers`, `SET NULL` |
| `ResolvedAt` | `timestamptz` | Yes | |

`TargetId` deliberately has **no FK** because `TargetType` is polymorphic. Enforce referential integrity in the application layer, and accept that deleting a reported post leaves a report pointing at nothing — which is correct for a moderation audit trail.

Index: `IX_ContentReports_Status`.

**Critical:** no report can be created from the UI. See 5.9.

#### `AuditLogs`

| Column | Type | Null | Notes |
|---|---|---|---|
| `Id` | `uuid` | No | PK |
| `AdminUserId` | `text` | No | FK→`AspNetUsers`, `RESTRICT` |
| `AdminUsername` | `varchar(256)` | No | Denormalized so the trail survives a rename |
| `Action` | `integer` | No | 9 values, 3.2 |
| `TargetId` | `uuid` | Yes | Polymorphic |
| `TargetLabel` | `varchar(300)` | Yes | Denormalized human-readable |
| `Reason` | `text` | Yes | |
| `Metadata` | `jsonb` | Yes | Maps to frontend `metadata: Record<string, unknown>` |
| `Timestamp` | `timestamptz` | No | |

**Append-only.** No `UPDATE` or `DELETE` is ever issued. Index `(Timestamp DESC)` and `(AdminUserId)`.

`TargetLabel` and `AdminUsername` are deliberate denormalizations: an audit record that cannot be read after the target is renamed or deleted is not an audit record.

### 2.6 New tables — Broadcasts (2)

#### `BroadcastAnnouncements`

| Column | Type | Null | Notes |
|---|---|---|---|
| `Id` | `uuid` | No | PK |
| `Title` | `varchar(200)` | No | |
| `Message` | `text` | No | |
| `Scope` | `integer` | No | `0=AllUsers, 1=CreatorsOnly, 2=DirectUser` |
| `TargetUserId` | `text` | Yes | FK→`AspNetUsers`, `CASCADE`. **Required iff `Scope = 2`** |
| `Severity` | `integer` | No | `0=Info, 1=Update, 2=Contest, 3=Warning` |
| `PublishedAt` | `timestamptz` | No | |
| `AdminUserId` | `text` | No | FK→`AspNetUsers`, `RESTRICT` |
| `AdminUsername` | `varchar(256)` | No | Denormalized |

**Check constraint** for the conditional `TargetUserId`:

```sql
ALTER TABLE "BroadcastAnnouncements"
  ADD CONSTRAINT "CK_BroadcastAnnouncements_TargetUserId"
  CHECK (("Scope" = 2) = ("TargetUserId" IS NOT NULL));
```

This is the one cross-field rule in the schema that a column type cannot express, and the frontend type does not enforce it either.

#### `BroadcastReceipts`

Required by `Scope = DirectUser` and by the unread badge the notifications page implies.

| Column | Type | Null | Notes |
|---|---|---|---|
| `Id` | `uuid` | No | PK |
| `BroadcastId` | `uuid` | No | FK→`BroadcastAnnouncements`, `CASCADE` |
| `UserId` | `text` | No | FK→`AspNetUsers`, `CASCADE` |
| `ReadAt` | `timestamptz` | Yes | Null = unread |

`UNIQUE (BroadcastId, UserId)`. Index `(UserId, ReadAt)`.

**Do not create a receipt row for every user of a broadcast.** For `AllUsers` and `CreatorsOnly`, read state is computed at query time (`ReadAt IS NULL` against the recipient's set); receipts exist only for `DirectUser`. This avoids a row per user per broadcast.

### 2.7 New table — `MediaAssets`

Not in any frontend DTO, but required to satisfy `StorageTelemetryDto` and the upload protocol's orphan problem.

| Column | Type | Null | Notes |
|---|---|---|---|
| `Id` | `uuid` | No | PK |
| `StorageKey` | `varchar(1000)` | No | **UNIQUE** — the reservation token |
| `OwnerUserId` | `text` | No | FK→`AspNetUsers`, `CASCADE` |
| `ContentType` | `varchar(100)` | No | |
| `SizeBytes` | `bigint` | No | |
| `Kind` | `integer` | No | `0=Avatar, 1=PostImage, 2=Document, 3=Thumbnail` |
| `Status` | `integer` | No | `0=Reserved, 1=Committed, 2=Orphaned` |
| `CreatedAt` | `timestamptz` | No | |
| `CommittedAt` | `timestamptz` | Yes | |
| `DeletedAt` | `timestamptz` | Yes | Soft delete for telemetry accuracy |

**This solves the three hard storage problems:**

1. **Validation before bytes** — `ContentType` and `SizeBytes` are known at the `upload-url` step, so a quota check happens before the browser uploads anything.
2. **Orphan collection** — a row in `Reserved` with no `CommittedAt` after N hours is garbage in storage and can be swept. Without this table, every abandoned upload is an invisible leak.
3. **Telemetry** — `SUM(SizeBytes) GROUP BY Kind, OwnerUserId` answers `StorageTelemetryDto` and `AdminUserListItem.storageUsedBytes` directly, instead of recomputing from every avatar and image row.

`Kind` maps cleanly to `StorageTelemetryDto.breakdown` (`imagesBytes`, `documentsBytes`, `thumbnailsBytes`).

### 2.8 New table — `StorageUsageDaily`

`StorageTelemetryDto` requires `monthlyBandwidthBytes` and `requestsCount`, which are **time-series** and cannot be derived from current rows.

| Column | Type | Notes |
|---|---|---|
| `Date` | `date` | PK component |
| `UserId` | `text` | PK component, FK→`AspNetUsers` |
| `BytesUploaded` | `bigint` | |
| `UploadRequests` | `integer` | |
| `BytesDownloaded` | `bigint` | Only if R2 logs egress |

`PK (Date, UserId)`. Roll up by month for the admin view. If R2 analytics are available, prefer querying them and **drop this table** — do not build both.

### 2.9 Full new-table summary

| # | Table | Purpose | Replaces nothing — net new |
|---|---|---|---|
| 1 | `PostLikes` | Like toggle | — |
| 2 | `CareerExperiences` | Career | — |
| 3 | `CareerAcademics` | Career | — |
| 4 | `CareerSkills` | Career | — |
| 5 | `CareerCredentials` | Career | — |
| 6 | `CareerLanguages` | Career | — |
| 7 | `CareerAchievements` | Career | — |
| 8 | `CareerVisibilitySettings` | Per-section visibility | — |
| 9 | `VerificationRequests` | Moderation | — |
| 10 | `FeaturedRequests` | Moderation | — |
| 11 | `ContentReports` | Moderation | — |
| 12 | `AuditLogs` | Moderation | — |
| 13 | `BroadcastAnnouncements` | Notifications | — |
| 14 | `BroadcastReceipts` | Per-recipient read state | — |
| 15 | `MediaAssets` | Storage accounting + orphans | — |
| 16 | `StorageUsageDaily` | Time-series telemetry | — |

**Final schema: 4 domain tables + 16 new = 20 domain tables, plus 6 Identity tables.**

### 2.10 Columns deliberately not created

| Not created | Why |
|---|---|
| `Posts.IsLiked` | Viewer-relative; resolved by joining `PostLikes` against the caller |
| `Posts.ThumbnailUrl` | Derived. Needs a thumbnail-generation decision first (no producer exists) |
| `Posts.ImageCount` | Derived — `COUNT` over `PostImages`, or maintained only if profiling shows a need |
| `Profiles.Username`, `Profiles.Email` | Already on `AspNetUsers`; joined in the DTO mapping |
| `AdminDashboardMetricsDto` counters | All derived; would go stale if stored |
| `CareerSummary` counts | Derived |
| `Tag` / `Category` tables | No tag or category entity exists in the frontend |
| `Notification` table | `BroadcastAnnouncements` + `BroadcastReceipts` cover it; a generic table would be speculative |
| Any social table | Not a social network |

### 2.11 Migration plan

> The empty `20260921125644_InitialCreate` must be resolved first — see 1.3. Do not add migrations until the snapshot matches the model.

| # | Migration | Contents |
|---|---|---|
| 0 | *(cleanup)* | Delete the empty `InitialCreate` if the snapshot is consistent; otherwise regenerate it |
| 1 | `AddProfileAndPostColumns` | `AspNetUsers.IsBanned/BanReason`; `Profiles` +7; `Posts.Tags/LikeCount` |
| 2 | `AddPostLikes` | `PostLikes` + composite unique index |
| 3 | `AddCareerTables` | 6 career tables + `CareerVisibilitySettings` |
| 4 | `AddModerationTables` | `VerificationRequests`, `FeaturedRequests`, `ContentReports`, `AuditLogs` |
| 5 | `AddBroadcastTables` | `BroadcastAnnouncements` + check constraint, `BroadcastReceipts` |
| 6 | `AddStorageTables` | `MediaAssets`, `StorageUsageDaily` |
| 7 | `SeedRoles` | `Admin`, `Creator`, `Curator` into `AspNetRoles` |

One migration per bounded concern, not one giant initial migration. Each is independently revertible.

**Postgres-specific note:** `Tags text[]`, `SkillsUsed text[]`, and `Metadata jsonb` are provider-specific. If the provider is ever swapped, these three columns need conversion. Everything else is portable.

---

## 3. DTOs

### 3.1 Rules

| Rule | Detail |
|---|---|
| Location | Request DTOs next to their use case. Response DTOs in `Features/{Area}/Common/{Area}Dtos.cs` |
| Form | `record` positional, one file per area |
| Serialization | `System.Text.Json` default, camelCase, enums as **integers** |
| Nullable | `?` for every field the frontend types as optional |
| Never | Return a domain entity. Never accept a domain entity |
| `void` endpoints | Return `Result` (no value) → `200 OK` with empty body, matching `ResultExtensions.ToResponse` |

**Enum serialization is the single most important DTO rule here.** The frontend declares `PostStatus` as a numeric union:

```ts
export const PostStatus = { Draft: 0, Published: 1, Unpublished: 2 } as const;
```

The existing backend declares `string Status` in `PostResponse` and populates it with `post.Status.ToString()` — producing `"Draft"`, not `0`. **This is a live type mismatch on every post read.** All response DTOs must use `PostStatus` (the enum) with `HasConversion<int>()`-style numeric serialization. See 6.1.

### 3.2 Enums

All in `Showcase.Domain/Enums/`, all stored as `integer`, all serialized as `integer`.

```csharp
public enum PostStatus { Draft = 0, Published = 1, Unpublished = 2 }   // exists

public enum VerificationStatus { None = 0, Pending = 1, Verified = 2, Rejected = 3 }
public enum FeaturedStatus { None = 0, Pending = 1, Featured = 2, Rejected = 3 }
public enum SkillCategory { Technical = 0, Design = 1, Leadership = 2, Tools = 3, General = 4 }
public enum LanguageProficiency { Native = 0, Fluent = 1, Professional = 2, Intermediate = 3, Basic = 4 }
public enum ContentReportTargetType { Post = 0, User = 1 }
public enum ContentReportReason { Copyright = 0, Impersonation = 1, Inappropriate = 2, Spam = 3, Other = 4 }
public enum ContentReportStatus { Pending = 0, Resolved = 1, Dismissed = 2 }
public enum VerificationRequestStatus { Pending = 0, Approved = 1, Rejected = 2 }
public enum BroadcastScope { AllUsers = 0, CreatorsOnly = 1, DirectUser = 2 }
public enum BroadcastSeverity { Info = 0, Update = 1, Contest = 2, Warning = 3 }
public enum MediaAssetKind { Avatar = 0, PostImage = 1, Document = 2, Thumbnail = 3 }
public enum MediaAssetStatus { Reserved = 0, Committed = 1, Orphaned = 2 }

public enum AuditAction
{
    UserBanned = 0, UserUnbanned = 1,
    VerificationApproved = 2, VerificationRejected = 3,
    PostHidden = 4, FeaturedPinned = 5, FeaturedUnpinned = 6,
    BroadcastSent = 7, RoleModified = 8,
}
```

`AuditAction` is a closed 9-value set matching the frontend union exactly. **Adding a value is a coordinated frontend + backend change.**

### 3.3 Shared

```csharp
// Features/Common/PagedResult.cs
public record PagedResult<T>(
    IReadOnlyList<T> Items,
    int PageNumber,
    int PageSize,
    int TotalCount,
    int TotalPages)
{
    public bool HasPreviousPage => PageNumber > 1;
    public bool HasNextPage => PageNumber < TotalPages;
}
```

**There are currently two `PaginatedList<T>` types** — `Application.Common.Models.PaginatedList<T>` and `Features.Posts.Common.PaginatedList<T>`. The former is **non-conformant**: it has no `PageSize`, which the frontend requires. Consolidate to one type in `Application/Common/Models/`. See 6.4.

```csharp
// Matches the existing IStorageService surface
public record UploadUrlResponse(string UploadUrl, string StorageKey);
public record UploadUrlRequest(string ContentType, long FileSizeBytes);
public record ReorderItem(Guid Id, int DisplayOrder);
```

### 3.4 Auth

```csharp
// Responses
public record AuthResponse(string AccessToken, string RefreshToken, DateTime? Expiry);
public record CurrentUserResponse(
    Guid Id, string Email, string Username,
    string FirstName, string LastName, Guid ProfileId,
    string? Bio, string? AvatarUrl,
    string? PhoneNumber, string? AccountNumber,
    bool IsVerified, VerificationStatus VerificationStatus,
    FeaturedStatus FeaturedStatus, bool IsFeaturedPinned,
    bool IsBanned, string? BanReason,
    IReadOnlyList<string> Roles);

// Requests
public record RegisterRequest(
    string Email, string Username, string Password,
    string FirstName, string LastName, string? Bio);
public record LoginRequest(string EmailOrUsername, string Password);
public record ChangePasswordRequest(string CurrentPassword, string NewPassword);
public record ChangeEmailRequest(string NewEmail, string CurrentPassword);
public record ChangeUsernameRequest(string NewUsername, string CurrentPassword);
public record UsernameAvailabilityResponse(bool Available);
```

**`Id` is `Guid`, not `string`.** The frontend types all ids as `string`; `System.Text.Json` serializes `Guid` as a JSON string, so the wire format is compatible. Do **not** use `string` in the DTO — it would weaken type safety for no benefit.

**`RegisterRequest.AvatarUrl` is dropped.** The frontend type has it, but the avatar flow is a 3-step upload and no screen sends it. Removing it is safe; keeping it implies a path that does not exist.

`Roles` is a `List<string>`, not `UserRole[]`, matching the frontend's `string[]`.

### 3.5 Profile

```csharp
// Features/Profiles/Common/ProfileDtos.cs

public record SocialLinkDto(Guid Id, string Platform, string Url, int DisplayOrder);

public record ProfileDetailsResponse(
    Guid Id, Guid UserId, string Email, string Username,
    string FirstName, string LastName,
    string? Specialty, string? Bio,
    string? AvatarKey, string? AvatarUrl,
    string? PhoneNumber, string? AccountNumber,
    bool IsVerified, VerificationStatus VerificationStatus,
    FeaturedStatus FeaturedStatus,
    IReadOnlyList<SocialLinkDto> SocialLinks,
    DateTime CreatedAt, DateTime? UpdatedAt);

public record PublicProfileResponse(
    Guid Id, string Username,
    string FirstName, string LastName,
    string? Specialty, string? Bio,
    string? AvatarUrl,
    bool IsVerified, VerificationStatus VerificationStatus,
    FeaturedStatus FeaturedStatus,
    IReadOnlyList<SocialLinkDto> SocialLinks);
```

**`PublicProfileResponse` deliberately omits** `phoneNumber`, `accountNumber`, `email`, `avatarKey`, `createdAt`, `updatedAt`. The frontend type includes the first two — see 6.3 before finalizing.

```csharp
// Requests
public record UpdateProfileRequest(
    string FirstName, string LastName,
    string? Specialty, string? Bio,
    string? PhoneNumber, string? AccountNumber);

public record UpdatePhoneRequest(string PhoneNumber, string? AccountNumber);

public record AddSocialLinkRequest(string Platform, string Url, int? DisplayOrder = null);
public record UpdateSocialLinkRequest(string Platform, string Url);
public record ReorderSocialLinksRequest(IReadOnlyList<ReorderItem> Items);
public record SocialLinkIdResponse(Guid Id);

// Verification / featured submission
public record SubmitVerificationRequest(
    string? Message, string? Notes, string? Category,
    string? IdentificationNumber,
    string? WebsiteUrl, string? PortfolioUrl, string? DocumentUrl);

public record SubmitFeaturedRequest(string Message, string? Notes);
```

**Reorder shape is pinned to `Items` only.** The frontend type declares both `items` and `orderedIds` as optional, and sends one. Accepting a union of two shapes doubles the test matrix for no benefit — accept `Items`, reject a request that omits it. See 6.5.

### 3.6 Posts

```csharp
// Features/Posts/Common/PostDtos.cs

public record PostImageDto(Guid Id, string StorageKey, string Url, int DisplayOrder);

public record PostCreatorDto(
    Guid ProfileId, string Username, string FirstName, string LastName,
    string? AvatarUrl, string? Bio, bool IsVerified);

public record PostDetailsResponse(
    Guid Id, Guid ProfileId,
    string Title, string Description, string? ExternalUrl,
    PostStatus Status,
    IReadOnlyList<string> Tags,
    int LikeCount, bool IsLiked,
    DateTime CreatedAt, DateTime? PublishedAt, DateTime? UpdatedAt,
    IReadOnlyList<PostImageDto> Images,
    PostCreatorDto? Creator);

public record PostSummaryResponse(
    Guid Id, Guid ProfileId,
    string Title, string Description, string? ExternalUrl,
    PostStatus Status,
    IReadOnlyList<string> Tags,
    int LikeCount, bool IsLiked,
    DateTime CreatedAt, DateTime? PublishedAt,
    string? ThumbnailUrl, int ImageCount,
    PostCreatorDto? Creator);

public record PostCreatedResponse(Guid Id);
public record PostImageAddedResponse(Guid ImageId);
public record PostImageUploadUrlResponse(string UploadUrl, string StorageKey);
public record ToggleLikeResponse(bool IsLiked, int LikeCount);

public record CreatePostRequest(
    string Title, string Description = "", string? ExternalUrl = null,
    IReadOnlyList<string>? Tags = null);

public record UpdatePostRequest(
    string Title, string Description, string? ExternalUrl,
    IReadOnlyList<string>? Tags);

public record ReorderPostImagesRequest(IReadOnlyList<ReorderItem> Items);
```

**Deltas from the current DTOs:** `Status` becomes `PostStatus` (was `string`); `Tags`, `LikeCount`, `IsLiked` are added to both; `PostCreatorDto` gains `Bio` and `IsVerified`.

`isLiked` resolves as: `UserId is null ? false : await PostLikes.AnyAsync(l => l.PostId == id && l.UserId == userId)`. Always return `false` rather than `null` for anonymous callers so the response shape is stable.

### 3.7 Career

```csharp
// Features/Career/Common/CareerDtos.cs

public record CareerExperienceResponse(
    Guid Id, string Company, string JobTitle,
    string StartDate, string? EndDate, bool CurrentlyWorking,
    string? EmploymentType, string? Location,
    string? Description, string? Achievements,
    IReadOnlyList<string> SkillsUsed, DateTime CreatedAt);

public record CareerAcademicResponse(
    Guid Id, string Institution, string Degree, string FieldOfStudy,
    string StartDate, string? EndDate, bool CurrentlyStudying,
    string? Location, string? Description, string? Gpa, string? Achievements,
    DateTime CreatedAt);

public record CareerSkillResponse(Guid Id, string Name, SkillCategory? Category, DateTime CreatedAt);

public record CareerCredentialResponse(
    Guid Id, string Name, string IssuingOrganization,
    string? IssueDate, string? ExpirationDate,
    string? CredentialId, string? VerificationUrl, string? MediaUrl,
    DateTime CreatedAt);

public record CareerLanguageResponse(
    Guid Id, string Language, LanguageProficiency Proficiency, DateTime CreatedAt);

public record CareerAchievementResponse(
    Guid Id, string Title, string? Type, string? Date, string? Organization,
    string? Description, string? Url, string? MediaUrl, DateTime CreatedAt);

public record CareerVisibilityResponse(
    bool Experience, bool Academics, bool Skills,
    bool Credentials, bool Languages, bool Achievements);

public record CareerSummaryResponse(
    int ExperienceCount, int AcademicsCount, int SkillsCount,
    int CredentialsCount, int LanguagesCount, int AchievementsCount);

public record PublicCareerData(
    CareerVisibilityResponse Visibility,
    IReadOnlyList<CareerExperienceResponse> Experiences,
    IReadOnlyList<CareerAcademicResponse> Academics,
    IReadOnlyList<CareerSkillResponse> Skills,
    IReadOnlyList<CareerCredentialResponse> Credentials,
    IReadOnlyList<CareerLanguageResponse> Languages,
    IReadOnlyList<CareerAchievementResponse> Achievements);
```

**Dates are `string` in the DTO, `date` in the database.** `2024-03-01` ↔ `"2024-03"`. The conversion lives in the mapping, never in the entity.

`Proficiency` is typed `LanguageProficiency` (not `| string`) — the frontend's `LanguageProficiency | string` union is unenforceable, so the backend is the place to enforce it.

```csharp
// Requests — one per section, matching the frontend's Omit<Id, CreatedAt> payloads
public record UpsertExperienceRequest(
    string Company, string JobTitle, string StartDate, string? EndDate,
    bool CurrentlyWorking, string? EmploymentType, string? Location,
    string? Description, string? Achievements, IReadOnlyList<string>? SkillsUsed);

public record UpsertAcademicRequest(
    string Institution, string Degree, string FieldOfStudy,
    string StartDate, string? EndDate, bool CurrentlyStudying,
    string? Location, string? Description, string? Gpa, string? Achievements);

public record UpsertSkillRequest(string Name, SkillCategory? Category);
public record UpsertCredentialRequest(
    string Name, string IssuingOrganization, string? IssueDate, string? ExpirationDate,
    string? CredentialId, string? VerificationUrl, string? MediaUrl);
public record UpsertLanguageRequest(string Language, LanguageProficiency Proficiency);
public record UpsertAchievementRequest(
    string Title, string? Type, string? Date, string? Organization,
    string? Description, string? Url, string? MediaUrl);

public record UpdateVisibilityRequest(
    bool? Experience, bool? Academics, bool? Skills,
    bool? Credentials, bool? Languages, bool? Achievements);

public record ToggleVisibilityRequest(bool IsVisible);
```

**Career create/update return the full entity** (matching the frontend's `Promise<CareerExperience>`), unlike post create which returns only `{ id }`. Both patterns are required by the frontend; do not unify them.

### 3.8 Likes

```csharp
public record ToggleLikeResponse(bool IsLiked, int LikeCount);
```

### 3.9 Admin

```csharp
// Features/Admin/Common/AdminDtos.cs

public record AdminUserListItemResponse(
    Guid Id, string Email, string Username, string FirstName, string LastName,
    string? AvatarUrl, IReadOnlyList<string> Roles, string Status,
    bool IsVerified, FeaturedStatus FeaturedStatus,
    int PostsCount, long StorageUsedBytes,
    DateTime CreatedAt, string? BanReason);

public record VerificationRequestResponse(
    Guid Id, Guid UserId, string Username, string FullName, string? AvatarUrl,
    string? Message, string? Notes, string Status,
    int PostsCount, DateTime SubmittedAt, string? DecisionNote);
// Plus the 5 evidence fields the current DTO omits — see 6.6

public record ContentReportResponse(
    Guid Id, Guid ReporterId, string ReporterUsername,
    ContentReportTargetType TargetType, Guid TargetId,
    string TargetTitle, string TargetAuthorUsername,
    ContentReportReason Reason, string Details,
    ContentReportStatus Status, DateTime CreatedAt, string? ActionTaken);

public record FeaturedRecommendationResponse(
    Guid Id, Guid UserId, string Username, string FullName, string? AvatarUrl,
    string? Headline, string Message,
    bool IsCuratedPinned, FeaturedStatus Status, DateTime SubmittedAt);

public record StorageConsumerResponse(
    Guid UserId, string Username, string FullName, string? AvatarUrl,
    long BytesUsed, int FilesCount);

public record StorageBreakdownResponse(long ImagesBytes, long DocumentsBytes, long ThumbnailsBytes);

public record StorageTelemetryResponse(
    long TotalCapacityBytes, long UsedBytes, int TotalFilesCount,
    long MonthlyBandwidthBytes, long RequestsCount,
    StorageBreakdownResponse Breakdown,
    IReadOnlyList<StorageConsumerResponse> TopConsumers);

public record AuditLogResponse(
    Guid Id, Guid AdminId, string AdminUsername,
    AuditAction Action, Guid? TargetId, string? TargetLabel,
    string? Reason, DateTime Timestamp, IReadOnlyDictionary<string, object>? Metadata);

public record BroadcastAnnouncementResponse(
    Guid Id, string Title, string Message,
    BroadcastScope Scope, string? TargetUserId,
    BroadcastSeverity Severity, DateTime PublishedAt, string AdminUsername);

public record AdminDashboardMetricsResponse(
    int TotalUsersCount, int ActiveCreatorsCount,
    int PendingVerificationsCount, int PendingReportsCount, int CuratedPinnedCount,
    long StorageUsedBytes, long StorageCapacityBytes,
    IReadOnlyList<AuditLogResponse> RecentAuditLogs,
    IReadOnlyList<BroadcastAnnouncementResponse> RecentBroadcasts);

public record BanUserRequest(string Reason);
public record UpdateUserRolesRequest(IReadOnlyList<string> Roles);
public record ResolveReportRequest(string ActionTaken);
public record PinFeaturedRequest(bool IsPinned);
public record CreateBroadcastRequest(
    string Title, string Message,
    BroadcastScope Scope, string? TargetUserId, BroadcastSeverity Severity);
```

**`Roles` is `IReadOnlyList<string>`, not `UserRole[]`.** The frontend's `UserRole[]` is a narrower fiction; the database stores strings and `AspNetUserRoles` is the source of truth.

**`Status` on `AdminUserListItemResponse` is a `string`** matching the frontend's `UserStatus` union — but see 6.7: the backend currently models ban as a boolean, and these two are not reconciled.

**Admin list endpoints return bare arrays, not `PagedResult<T>`.** This matches the frontend exactly but will not scale. See 6.8 for the recommended migration path.

### 3.10 Notifications

```csharp
// Features/Notifications/Common/NotificationDtos.cs

public record NotificationResponse(
    Guid Id, string Title, string Message,
    BroadcastSeverity Severity, DateTime PublishedAt,
    bool IsRead);

public record UnreadCountResponse(int UnreadCount);
```

`IsRead` is per-viewer, resolved by left-joining `BroadcastReceipts` on the caller's id. For `AllUsers`/`CreatorsOnly` broadcasts with no receipt row, `IsRead` is `false`.

This replaces the frontend's dependence on `GET /api/admin/broadcasts` (6.9).

### 3.11 DTO gap summary

| # | Gap | Impact |
|---|---|---|
| 1 | `PostResponse.Status` is `string`; frontend wants `PostStatus` (int) | **Every post read returns the wrong type** |
| 2 | `PostResponse` / `PostSummaryResponse` missing `Tags`, `LikeCount`, `IsLiked` | Fields silently absent from every response |
| 3 | `PostCreatorDto` missing `Bio`, `IsVerified` | Author card incomplete |
| 4 | `PaginatedList<T>` missing `PageSize` in one of two definitions | Envelope incomplete |
| 5 | `VerificationRequestItem` missing 5 evidence fields | Admin cannot review evidence |
| 6 | `FeaturedRecommendationItem.Headline` has no submit source | Field always null |
| 7 | `UserStatus` (admin) vs `isBanned` (user) unreconciled | Two models of one concept |
| 8 | `PublicProfileResponse` includes `phoneNumber`/`accountNumber` | Potential PII disclosure |
| 9 | `AccountNumber` has no defined meaning | Unmapped field |
| 10 | `IsFeaturedPinned` missing from the public/owner DTOs | Admin-only field not readable |

---

## 4. Feature Modules

### 4.1 Slice template

Every new use case follows the existing three-file pattern:

```
Features/{Area}/{Commands|Queries}/{UseCase}/
├── {UseCase}Command.cs              record ... : IRequest<Result<T>>
├── {UseCase}CommandHandler.cs       IRequestHandler<,>, constructor injection
└── {UseCase}CommandValidator.cs     AbstractValidator<T>, FluentValidation
```

Queries follow the same shape with `{UseCase}Query.cs`. Response DTOs go in `Features/{Area}/Common/{Area}Dtos.cs`. Endpoints go in `Showcase.Api/Endpoints/{Area}/{UseCase}.cs` implementing `IEndpoint`.

### 4.2 Auth — complete, one gap

All 8 endpoints exist. **Missing: `GET /api/auth/check-username`**, which the register wizard calls live (`useRegisterWizard.ts:38`) and which has no endpoint file.

Add: `CheckUsernameAvailability` query + endpoint. Anonymous, rate-limited, returns `{ available: boolean }`.

### 4.3 Profile — 7 of 14

**Exists:** `GetMyProfile`, `GetPublicProfile`, `UpdateProfile`, `GetAvatarUploadUrl`, `UpdateAvatar`, `RemoveAvatar`.

**Missing — 7 use cases:**

| Use case | Kind | Notes |
|---|---|---|
| `GetProfiles` | Query | **Must return `PublicProfileResponse[]`, not the owner shape.** See 6.3 |
| `UpdatePhone` | Command | Maps to `AspNetUsers.PhoneNumber` |
| `SubmitVerificationRequest` | Command | Enforces one pending via the partial unique index |
| `SubmitFeaturedRequest` | Command | Same pattern |
| `GetProfilePosts` | Query | Already exists under Posts; expose on the profile route |
| — | — | `RemoveAvatar` must delete the R2 object, not just null the key |

### 4.4 Social links — complete

4 endpoints exist. The reorder endpoint needs its request type pinned to `Items` (6.5).

### 4.5 Posts — 12 of 15

**Exists:** CRUD, publish, unpublish, explore, mine, by-id, image upload-url/add/remove/reorder.

**Missing — 3 use cases:**

| Use case | Kind | Notes |
|---|---|---|
| `ToggleLikePost` | Command | Transactional with `LikeCount`. See the invariant below |
| `AddTags` | — | Fold into `CreatePost`/`UpdatePost`; `Tags` is not a separate resource |
| `GetProfilePosts` | Query | Confirm the route alias exists |

**`ToggleLikePost` invariant** — the single most error-prone operation in the system:

```
BEGIN
  DELETE FROM PostLikes WHERE PostId = @p AND UserId = @u RETURNING 1;
  if deleted:
      UPDATE Posts SET LikeCount = GREATEST(LikeCount - 1, 0) WHERE Id = @p;
      isLiked = false
  else:
      INSERT INTO PostLikes (PostId, UserId, CreatedAt) VALUES (@p, @u, now());
      UPDATE Posts SET LikeCount = LikeCount + 1 WHERE Id = @p;
      isLiked = true
COMMIT
  return { isLiked, likeCount from the UPDATE ... RETURNING }
```

Read `LikeCount` from the `UPDATE ... RETURNING` clause rather than re-querying, so the response cannot disagree with the write. The composite unique index makes the double-like case fail loudly rather than corrupt the count. Never decrement below zero — a bug that surfaces as a negative count on a public page.

**`Tags` validation:** max 10, each trimmed, non-empty, deduplicated case-insensitively, max 50 chars each. The frontend caps at 10 (`WizardStepEditorial.tsx:55,74,97`) and prevents duplicate selection in the UI, but the backend must not trust that.

### 4.6 Career — 0 of 28, the largest module

Six sections × 4 use cases, plus visibility and public reads. Because all six follow an identical shape, implement **one generic base** and six thin configurations rather than 24 hand-written triplets.

```
Features/Career/
├── Common/
│   ├── CareerDtos.cs
│   ├── ICareerSection.cs          generic contract per section
│   └── CareerQueryHandlers.cs     shared visibility + ownership logic
├── Commands/{Upsert,Delete}{Section}/
├── Queries/Get{Plural}/
└── Commands/SetVisibility/, Commands/ToggleSectionVisibility/
```

Shared behavior that must not be duplicated six times:
- Ownership: resolve `Profile.Id` from `ICurrentUserService.UserId` — never from the request
- Public filtering: exclude sections where the visibility flag is `false`
- Date validation: `YYYY-MM` parse, `EndDate >= StartDate`, `EndDate` null iff `CurrentlyWorking`/`CurrentlyStudying`
- Date serialization: `date` ↔ `YYYY-MM` in the mapping

Date rules, enforced once:
```csharp
RuleFor(x => x.StartDate)
    .Must(BeYearMonth).WithMessage("Start date must be in YYYY-MM format.");

RuleFor(x => x.EndDate)
    .Must(BeYearMonthOrEmpty).WithMessage("End date must be in YYYY-MM format.")
    .GreaterThanOrEqualTo(x => x.StartDate).WithMessage("End date cannot be before start date.")
    .When(x => !string.IsNullOrEmpty(x.EndDate));

RuleFor(x => x.CurrentlyWorking)
    .Must((x, working) => !working || string.IsNullOrEmpty(x.EndDate))
    .WithMessage("Cannot set an end date while currently working.");
```

**These are the first validation rules the career module needs** — the frontend forms apply none (see `PORITY_FRONTEND_SCREENS_AND_DATA.md` §8), so the backend is the only enforcement point.

### 4.7 Moderation — 0 of 7

| Use case | Kind | Notes |
|---|---|---|
| `SubmitVerificationRequest` | Command | One pending per profile |
| `SubmitFeaturedRequest` | Command | One pending per profile |
| `GetVerificationRequests` | Query | Admin |
| `ApproveVerificationRequest` | Command | Sets `IsVerified`, status, `Profiles.IsVerified`, writes audit |
| `RejectVerificationRequest` | Command | Sets status, `DecisionNote`, writes audit |
| `CreateContentReport` | Command | **No UI exists** — see 5.9 |
| `ResolveReport` / `DismissReport` | Command | Admin, writes audit |

**`ApproveVerificationRequest` must be transactional across three tables:**

```
BEGIN
  UPDATE VerificationRequests SET Status = 1, DecisionNote = @n,
         DecidedByUserId = @admin, DecidedAt = now() WHERE Id = @id AND Status = 0;
  if 0 rows affected: return Conflict (already decided)
  UPDATE Profiles SET IsVerified = true, VerificationStatus = 2,
         UpdatedAt = now() WHERE Id = @profileId;
  INSERT INTO AuditLogs (...);
COMMIT
```

`AND Status = 0` makes double-approval a `409 Conflict` rather than a silent overwrite — this is the optimistic-concurrency guard, and it is the only thing standing between two admins and an inconsistent state.

**Every moderation action writes an `AuditLog` in the same transaction.** A moderation action with no record is unrecoverable, and the frontend reads audit logs expecting a complete trail.

### 4.8 Admin — 0 of 19

| Screen | Use cases | Hard requirement |
|---|---|---|
| Dashboard | `GetDashboardMetrics` | 7 counters, all derived |
| Users | `GetUsers`, `BanUser`, `UnbanUser`, `UpdateUserRoles` | See safeguards below |
| Verifications | `GetVerifications`, `Approve`, `Reject` | Audit each decision |
| Reports | `GetReports`, `ResolveReport`, `DismissReport` | Audit each decision |
| Featured | `GetFeatured`, `PinFeatured`, `Approve`, `Reject` | Audit each decision |
| Storage | `GetStorageTelemetry` | From `MediaAssets` |
| Audit logs | `GetAuditLogs` | Read-only |
| Broadcasts | `GetBroadcasts`, `CreateBroadcast` | Enforce the `TargetUserId` check constraint |

**`UpdateUserRoles` safeguards** — the frontend provides none of these, and all three are mandatory:

1. **No self-demotion.** An admin removing their own `Admin` role can lock the platform out permanently.
2. **Never remove the last admin.** Count admins; if it is 1, reject.
3. **A banned user loses access immediately.** A simple `SecurityStamp` invalidation forces token revalidation on the next request; without it, a banned user's access token stays valid until it expires.

**`GetDashboardMetrics.ActiveCreatorsCount`** needs a definition the frontend does not supply (see 5.10). Start with "has at least one published post" and document it.

### 4.9 Storage & notifications — 0 of 6

| Use case | Notes |
|---|---|
| `GetMediaUploadUrl` | Validate `ContentType` + `SizeBytes` **before** issuing the URL. Insert a `MediaAssets` row in `Reserved` |
| `CommitMediaAsset` | Flip `Reserved` → `Committed`. Enforce the key's owner |
| `GetNotifications` | Recipient-filtered, `IsRead` resolved per viewer |
| `MarkNotificationRead` | Upsert a `BroadcastReceipts` row |
| `MarkAllNotificationsRead` | Bulk insert receipts for the unread set |
| `GetUnreadCount` | One count for the badge |

`IStorageService` already has the right shape (`GetPresignedUploadUrlAsync`, `GetPublicUrl`, `DeleteAsync`) — extend it, do not replace it.

**A `SweepOrphanedAssets` background job** deletes `Reserved` rows older than 24 hours and their objects. Without it, every abandoned upload leaks storage forever. `IHostedService` is sufficient; a full job framework is not warranted for one task.

### 4.10 Feature build order

Sequenced so each step is independently verifiable and the frontend stays usable.

| # | Module | Why here |
|---|---|---|
| 1 | Fix the 10 DTO defects (§3.11) | Nothing else can be verified until the shapes are right |
| 2 | Fix the 4 endpoint defects (§6) | Includes a **live break** (publish verb) |
| 3 | Resolve the empty migration, add migration 1 + 2 | `PostLikes` unblocks likes |
| 4 | Likes (`ToggleLikePost`) | Small, self-contained, exercises the write path |
| 5 | Profile gaps + `check-username` | Unblocks registration |
| 6 | Career — visibility + experiences first | Largest module; proves the generic pattern before 5 more sections |
| 7 | Career — remaining 5 sections | Pattern already proven by step 6 |
| 8 | Moderation + `AuditLogs` | Audit must exist before any moderation action |
| 9 | Admin — users, dashboard, storage | Depends on audit + `MediaAssets` |
| 10 | Broadcasts + notifications | Replaces the admin-endpoint dependency |
| 11 | Account deletion, OAuth | Both blocked on product decisions (5.7, 5.8) |
| 12 | Storage telemetry time-series | Only worth building once volume justifies it |

---

## 5. ASP.NET Core Tools & Libraries

### 5.1 Already in use — keep

| Package | Version | Layer | Why it is there |
|---|---|---|---|
| `Microsoft.EntityFrameworkCore` | 10.0.12 | Application, Api | Data access |
| `Npgsql.EntityFrameworkCore.PostgreSQL` | 10.0.3 | Infrastructure | Postgres provider |
| `Microsoft.EntityFrameworkCore.Design` | 10.0.12 | Api | Migrations / design-time |
| `MediatR` | 14.2.0 | Application | CQRS dispatch |
| `FluentValidation.DependencyInjectionExtensions` | 12.1.1 | Application | Request validation |
| `Microsoft.AspNetCore.Identity.EntityFrameworkCore` | 10.0.12 | Infrastructure | User/role store |
| `Microsoft.AspNetCore.Authentication.JwtBearer` | 10.0.12 | Infrastructure | Token auth |
| `AWSSDK.S3` | 4.0.103.3 | Infrastructure | Cloudflare R2 (S3-compatible) |
| `Swashbuckle.AspNetCore` | 10.2.3 | Api | OpenAPI / Swagger |
| `Microsoft.AspNetCore.OpenApi` | 10.0.8 | Api | OpenAPI document |

Built-in ASP.NET Core already providing value: **Minimal APIs** (`IEndpoint` pattern), **ProblemDetails** (`AddProblemDetails()` + `Results.Problem`), **Rate Limiting** (`AddRateLimiter` with 3 policies), **Health Checks** (`/health`, `/health/live`), **CORS**, **Options pattern** (`JwtSettings`, `R2Settings`), **`HttpContextAccessor`**, **Global exception handler**.

### 5.2 To add

Ordered by value. Each earns its place against a concrete need in this design.

| Package | Why this project needs it | Alternatives considered |
|---|---|---|
| `Testcontainers.PostgreSql` | **Highest value.** `EF InMemory` does not enforce relational constraints, unique indexes, check constraints, or cascades. The `LikeCount` transaction, the partial unique index, and the broadcast check constraint are all untestable on InMemory | Testcontainers against a live Postgres is the only way to verify them |
| `Microsoft.AspNetCore.Mvc.Testing` | `WebApplicationFactory<Program>` for integration tests. The existing test project references only Infrastructure, so endpoints are untested | Direct HTTP calls to a running host — slower, less ergonomic |
| `NetArchTest.Rules` | Enforces the dependency rule (`Domain` references nothing; `Application` does not reference `Infrastructure`). The architecture is correct today and undocumented; one test keeps it that way | Manual review — does not survive a new hire |
| `FluentAssertions` | Readable assertions for error-code and `Result` assertions. xUnit's built-in `Assert` makes `Error.Code` checks noisy | xUnit asserts — works, more verbose |
| `Bogus` | Deterministic test data. Career has 6 near-identical sections; hand-writing fixtures for each is unmaintainable | Hardcoded fixtures |
| `Serilog.AspNetCore` | `LoggingBehavior` exists but writes through `ILogger`. Serilog gives structured output and a request-id correlator. Worth it once there is a log aggregator | `ILogger` + a JSON provider — adequate now |
| `Npgsql` (raw) | `MediaAssets` sweeps and `StorageUsageDaily` rollups are set-based. One `ExecuteSqlInterpolated` is clearer than materializing rows | EF Core `ExecuteUpdate` — prefer this where it suffices; keep Npgsql only for set-based work EF cannot express |

**Deliberately not added:**

| Not added | Why |
|---|---|
| `EFCore.NamingConventions` (snake_case) | The existing schema is PascalCase. Adopting it now means rewriting all 4 tables and invalidating the existing migration history for a cosmetic gain |
| AutoMapper / Mapster | The existing handlers map by hand with `new PostResponse(...)`. Explicit mapping is more code but the DTOs are small and the projection is a compiler-checked constructor call. AutoMapper hides field mismatches — which is exactly the class of bug in §6.1 |
| MediatR `IRequest` behaviors beyond the 2 present | Logging + Validation covers it. Caching and performance behaviors would need real profiling first |
| A message bus / outbox | The frontend needs no asynchronous delivery. `BroadcastAnnouncements` + `BroadcastReceipts` plus synchronous handling satisfies the contract (see `PORITY_BACKEND_REQUIREMENTS.md` §18.2) |
| A full job scheduler (Quartz/Hangfire) | One task needs a background run: `SweepOrphanedAssets`. `IHostedService` with a `PeriodicTimer` is sufficient |
| MediatR `ValidationBehavior` duplication | Already present — just ensure the new slices use it rather than validating in the endpoint |
| API versioning | No version segment appears in any frontend route. Adding it is speculative |
| SignalR / WebSocket | No live-update requirement exists in the frontend |

### 5.3 One licensing item to confirm

**MediatR 14.2.0.** MediatR became commercially licensed at version 13; earlier versions were Apache-2.0. Version 14 therefore implies a commercial license. Confirm the license posture before adding 60+ new slices to the codebase. If it is unlicensed, the alternatives are:

- **Keep 12.x** (Apache-2.0) — the API surface used here (`IRequest`, `IRequestHandler`, `ISender`, `AddOpenBehavior`) is identical across 12 and 14, so this is a version pin, not a rewrite
- **Drop MediatR** for a hand-rolled dispatcher — roughly 80 lines, and the 3-file slice pattern already carries most of the cost

This is a decision for the project owner, not a technical one. Flagging it because it affects a large amount of new code.

### 5.4 Registration for the new services

```csharp
// Add to AddApi()
builder.Services.AddAuthorizationBuilder()
    .AddPolicy("AdminOnly", p => p.RequireRole("Admin"))
    .AddPolicy("StaffOnly", p => p.RequireRole("Admin", "Curator"));
```

Role checks then read `.RequireAuthorization("AdminOnly")` on endpoints, which is self-documenting and removes scattered role-name strings. The current `.RequireAuthorization()` performs **authentication only — no role check** on any admin endpoint. See 6.10.

For the orphan sweep, register a single `BackgroundService`:

```csharp
builder.Services.AddHostedService<OrphanedAssetSweepService>();
```

### 5.5 Project-level changes needed

| Change | Reason |
|---|---|
| `Showcase.Application` → add `Microsoft.AspNetCore.App` `FrameworkReference` | Currently only Infrastructure has it. The orphan-sweep service and any ASP.NET-dependent behavior need it. If the sweep lives in Infrastructure instead, no change is needed |
| `Showcase.Infrastructure.Tests` → add `Testcontainers.PostgreSql`, `Microsoft.AspNetCore.Mvc.Testing` | See 5.2 |
| New test project `Showcase.Api.Tests` | Endpoint tests have no home today; the existing project references only Infrastructure |
| `Showcase.slnx` → add the new test project | Otherwise it will not build in CI |
| `Directory.Build.props` | Consider `<TreatWarningsAsErrors>` once the build is clean |

---

## 6. Defects to Fix

Found by comparing the built backend against the frontend contracts. **D1 is a live break today.**

### 6.1 `Status` serialized as string, frontend expects number

`PostResponse.Status` is `string`, populated by `post.Status.ToString()` (`GetPostByIdQueryHandler.cs:88`). The frontend declares:

```ts
export const PostStatus = { Draft: 0, Published: 1, Unpublished: 2 } as const;
```

**Every post read returns `"Draft"` where `0` is expected.** `PostStatusName[post.status]` yields `undefined`, so the status badge renders blank on every post.

**Fix:** type the DTO field as `PostStatus` and let the numeric enum serialize.

### 6.2 `publish` / `unpublish` verb mismatch — live break

| Side | Method |
|---|---|
| Frontend `apiClient.posts.ts:122,129` | `POST` |
| Backend `PublishPost.cs:16`, `UnpublishPost.cs:16` | `MapPut` |

**Publishing a post from the studio fails today.** `POST` to a `PUT`-only route returns `405`.

**Fix:** `POST` is correct for a state transition that is not idempotent-by-URL. Change the backend to `MapPost`.

### 6.3 `GET /api/profiles` returns owner data anonymously

The endpoint is `requiresAuth: false` and expects `ProfileDetailsResponse[]` — which includes `email`, `avatarKey`, `phoneNumber`, `accountNumber`, `createdAt`. **Both `/feed` and `/feed/search` call it.**

If implemented as the frontend expects, every anonymous visitor receives every user's email address.

**Fix:** return `PublicProfileResponse[]`, and add the `StaffOnly` policy. If no screen genuinely needs an all-profiles list, remove the endpoint and fix the feed to use a proper directory query.

### 6.4 Two `PaginatedList<T>` types, one missing `PageSize`

`Application.Common.Models.PaginatedList<T>` has no `PageSize`. The frontend requires it. `Features.Posts.Common.PaginatedList<T>` has it. The two types have the same name and different shapes.

**Fix:** one `PagedResult<T>` in `Application/Common/Models/`. Delete the Posts-local copy.

### 6.5 Reorder accepts two request shapes

`ReorderPostImagesRequest` declares `items` **and** `orderedImageIds`; `ReorderSocialLinksRequest` declares `items` **and** `orderedIds`. Both are optional, so an empty `{}` is valid. The frontend sends one.

**Fix:** accept `Items` only, mark it required in the validator.

### 6.6 Verification evidence not in the admin read model

`VerificationRequestDto` accepts `category`, `identificationNumber`, `websiteUrl`, `portfolioUrl`, `documentUrl`. The admin DTO has none of them. **An admin cannot see what the applicant submitted.**

**Fix:** add all five to `VerificationRequestResponse`. Additionally, `IdentificationNumber` is sensitive PII — it must not appear in any non-admin read model or in `AuditLog.Metadata`.

### 6.7 `isBanned` vs `UserStatus` unreconciled

The frontend models both: `isBanned: boolean` on user types, and `UserStatus: "active" | "suspended" | "pending_review"` on admin types. Only ban/unban are operable.

**Fix:** pick one model. Simplest consistent option: `IsBanned` + `BanReason` on `AspNetUsers`, and derive `Status` in the admin DTO as `"suspended"` when `IsBanned` else `"active"`. Introduce `pending_review` only when something can actually set it.

### 6.8 Admin lists unpaginated

All 5 admin list endpoints return bare arrays. `/admin/audit-logs` has no filter at all.

**Fix:** migrate to `PagedResult<T>`. This is a **frontend-visible change** — the admin pages must handle a new envelope. Schedule it with the frontend work, not silently.

### 6.9 Notifications reads an admin endpoint

`NotificationsPage` → `apiClient.getBroadcasts()` → `GET /api/admin/broadcasts`. Once real authorization applies, the user-facing notifications page receives `403`.

**Fix:** add `GET /api/notifications` returning recipient-filtered `NotificationResponse[]` with per-viewer `IsRead`, and point the page at it.

### 6.10 No role checks on admin endpoints

Every admin endpoint uses bare `.RequireAuthorization()`, which validates a token but **does not check a role**. Any authenticated creator satisfies it.

**Fix:** `.RequireAuthorization("AdminOnly")` on all admin endpoints, `"StaffOnly"` where curators are permitted. See 5.4.

### 6.11 `Post.Publish()` requires an image, and the UI does not know

`Post.cs:70-72` returns `CannotPublishEmptyPost` when there are no images. The frontend has no such rule — `WizardStepReview` shows a preview and the studio offers Publish regardless.

A creator writing a text-only post hits an unexplained `400`.

**Fix (choose one):**
- **(a) Relax the domain rule** — allow publishing with zero images, since `PostImage` is optional in the frontend model
- **(b) Keep the rule, enforce it in the UI** — disable Publish with a hint when `images.length === 0`
- **(c) Keep the rule, improve the error** — a `400` with a message the UI can surface

**(a) is recommended** unless a published post without work is genuinely undesirable. The frontend never requires an image, so the rule is a backend-only invention.

### 6.12 The empty migration

`20260921125644_InitialCreate` has an empty `Up()` and `Down()`. See 1.3.

### 6.13 `RegisterRequest.AvatarUrl` is a dead field

Declared in the frontend type, never sent by any screen, and the avatar flow is a 3-step upload.

**Fix:** remove from the backend DTO so it does not imply an unimplemented path.

---

## 7. Open Decisions

Carried from `PORITY_BACKEND_REQUIREMENTS.md` §19, narrowed to those that change **this** design.

| # | Decision | Blocks |
|---|---|---|
| 1 | Are `phoneNumber` / `accountNumber` public? | `PublicProfileResponse` shape (3.5), `Profiles.AccountNumber` (2.2) |
| 2 | What should `GET /api/profiles` return? | Feed and search (4.3, 6.3) |
| 3 | Notification model — build or descope? | 4 tables vs 2, `BroadcastReceipts` (2.6) |
| 4 | Verification evidence — retain or discard? | `VerificationRequests` columns (2.5), admin DTO (6.6) |
| 5 | Is content reporting in scope? | `ContentReports` (2.5), `CreateContentReport` (4.7) |
| 6 | Publish with zero images — allowed? | `Post.Publish()` (6.11) |
| 7 | `isBanned` or `UserStatus`? | `AspNetUsers` (2.2), admin DTO (6.7) |
| 8 | What makes a creator "active"? | `ActiveCreatorsCount` (4.8) |
| 9 | Account deletion semantics | Nothing yet — 4.10 step 11 |
| 10 | Thumbnail generation — needed? | `PostSummaryResponse.ThumbnailUrl` (3.6) |
| 11 | R2 egress analytics available? | `StorageUsageDaily` (2.8) |
| 12 | MediatR license posture | 60+ new slices (5.3) |

---

### Document Confidence

| Section | Confidence | Basis |
|---|---|---|
| Existing schema (1.4) | **High** | Read from the actual migration file |
| Existing conventions (1.5) | **High** | Read from 12+ source files |
| Extensions to existing tables (2.2) | **High** | Direct field-by-field mapping from frontend types |
| New table designs (2.3–2.8) | **High** | One-to-one with frontend types; column types follow the existing migration's conventions |
| DTO contracts (3) | **High** | Mapped field-by-field from the 6 frontend type files |
| Defects in §6 | **High** | Each verified by direct source comparison, with file and line cited |
| Feature breakdown (4) | **Medium** | Slice shape is proven by the existing code; the generic Career abstraction (4.6) is a proposal, not a validated design |
| Package choices (5.2) | **Medium** | Each justified against a concrete need, but not benchmarked |
| `StorageUsageDaily` necessity (2.8) | **Low** | Depends on decision 11 — may be unnecessary if R2 analytics exist |
| The generic Career base (4.6) | **Low** | Plausible but unproven; validate with the Experience section before committing to all 6 |

**Strongest basis:** the existing backend has a real migration, a consistent set of conventions across 195 files, and 31 endpoints. Section 1 and the §6 defects are read directly from source.

**Not verified:**
- **No code was executed.** The build status, the migration consistency, and every runtime behavior are unconfirmed. Section 1.3 in particular is based on reading the migration file, not applying it.
- The `Post.Publish()` empty-image rule was read from source, not reproduced.
- The empty-migration conclusion assumes `ApplicationDbContextModelSnapshot.cs` matches `InitialPostgreSql` — **verify by running `dotnet ef migrations has-pending-model-changes` before touching anything.**

**Highest-value next step:** run `dotnet ef migrations has-pending-model-changes` and `dotnet ef database update` against a scratch Postgres. That single check validates the entire §1.4 baseline and confirms whether §6.12 is a stub or a real problem.
