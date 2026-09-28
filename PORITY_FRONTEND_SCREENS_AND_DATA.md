# Pority — Frontend Screens & Data Reference

> **Document type:** Reference documentation of the existing frontend, `Showcase.ClientApp`.
> **Purpose:** A complete map of the screens and the data they use, reverse-engineered from source.
> **No frontend or backend code was created or modified to produce this document.**
> **Companion to:** `PORITY_BACKEND_REQUIREMENTS.md` (the backend contract this frontend expects).

---

## 1. Overview

**Pority is a personal web-presence and portfolio platform.** Individuals publish a profile with biographical data, social links, a body of creative work, and a structured career history. Administrators moderate the platform.

**It is not a social network.** There is no follower graph, no messaging, no comments, and no social activity feed.

### 1.1 Scale

| Metric | Value |
|---|---|
| Feature areas | 9 |
| Screens (page components) | 46 |
| Feature components | 93 |
| Shared components | 14 |
| Custom hooks | 9 |
| Route entries | 50 |
| Type definition files | 6 |
| API client methods | 79 |
| TypeScript/TSX files | 240 (~765 KB) |

### 1.2 Stack

| Concern | Choice |
|---|---|
| Framework | React + TypeScript |
| Build | Vite |
| Routing | React Router (lazy-loaded routes) |
| Data fetching | Custom `useAsyncData` hook — no React Query/SWR |
| State | React Context (`AuthContext`, `ToastContext`) — no Redux/Zustand |
| Styling | Tailwind CSS |
| Icons | `PlatformIcon` (custom, per social platform) |
| Path aliases | `@shared/*`, `@features/*` |
| Backend | REST + JSON, optional mock layer |

### 1.3 The mock switch — the single most important fact

`shared/api/apiClient.base.ts:3`

```ts
export const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API !== "false";
```

**Mocks are ON by default.** The comparison is a strict string match against `"false"`, and no `.env` file is committed to the repository. Until `VITE_USE_MOCK_API=false` is set explicitly, the application runs entirely against `localStorage`-backed in-memory services and **zero requests reach a real backend.**

Every API method in this codebase is therefore written but **unexercised against the live API**. Section 9 lists what this hides.

### 1.4 Route aliases

Several screens are reachable by more than one path. These are intentional, not duplication bugs:

| Screen | Aliases |
|---|---|
| Studio dashboard | `/`, `/studio`, `/posts/mine` |
| Search results | `/feed/search`, `/search` |
| Explore | `/explore` → redirects to `/feed` |
| Security hub | `/settings`, `/settings/security` |
| Settings profile | `/settings/profile` → redirects to `/profile/edit` |
| Two-factor | `/settings/security/two-factor` → redirects to `/settings/security` |
| Sessions | `/settings/security/sessions` → redirects to `/settings/security` |

---

## 2. App Shell, Navigation & Guards

### 2.1 Layout components

| File | Role |
|---|---|
| `shared/layout/Sidebar.tsx` | Desktop side navigation |
| `shared/layout/SidebarNavLinks.tsx` | Sidebar link list |
| `shared/layout/SidebarUserMenu.tsx` | Sidebar user block + menu |
| `shared/layout/MobileTopBar.tsx` | Mobile header |
| `shared/layout/MobileBottomNav.tsx` | Mobile bottom tab bar |
| `shared/layout/Footer.tsx` | Site footer |
| `shared/layout/DemoSwitcher.tsx` | **Persona switcher — mock only** |
| `features/admin/components/AdminLayout.tsx` | Separate admin shell with its own nav |
| `features/auth/components/AuthCardLayout.tsx` | Centered card shell for login/register |

### 2.2 Personas

`DemoSwitcher` cycles `visitor | creator | admin`, persisted at `localStorage` key `showcase_active_persona` (default `creator`).

**This is a demo mechanism, not a security boundary.** It calls `mockService.getActivePersona()` / `setActivePersona()` unconditionally with no real API path. It does not grant access to admin screens in the real system — see section 2.3.

### 2.3 Route guards

| Guard | Location | Role |
|---|---|---|
| `AdminRouteGuard` | `features/admin/components/` | Wraps `/admin/*`; checks for admin role |
| `VisitorGuard` | `shared/components/` | Detects a logged-in visitor browsing creator routes |

### 2.4 Auth state

`AuthContext` (`shared/context/AuthContext.tsx`, consumed via `useAuth`) is the single source of truth for the session.

| Concern | Implementation |
|---|---|
| Access token | `localStorage` → `showcase_auth_token` |
| Refresh token | `localStorage` → `showcase_refresh_token` |
| Hydration | `apiClient.getCurrentUser()` on load |
| Failure behavior | Any error ⇒ `null` ⇒ treated as logged out |
| Notifications | `ToastContext` → `useToast` |

`getCurrentUser` catches **all** errors and returns `null`, so a 500 is indistinguishable from a logged-out user. See section 9.3.

---

## 3. Screens Catalogue

46 screens across 9 feature areas. "Data" lists the entities each screen reads or writes.

### 3.1 Auth — 3 screens

| Route | File | Purpose | Data |
|---|---|---|---|
| `/login` | `LoginPage.tsx` | Email-or-username + password sign-in | `CurrentUserResponse` |
| `/register` | `RegisterWizardPage.tsx` | Multi-step registration wizard | Creates `UserAccount` + `Profile` |
| `/auth/complete-oauth` | `CompleteOAuthPage.tsx` | OAuth callback landing | **None — no provider wired** |

**Registration wizard** — 4 steps, 7 components:

| Step | Component | Data captured |
|---|---|---|
| Credentials | `CredentialsStep.tsx` | `email`, `username`, `password` |
| Personal info | `PersonalInfoStep.tsx` | `firstName`, `lastName` |
| Avatar | `AvatarUploadStep.tsx` | optional avatar |
| Review | — | Confirmation |

Supporting: `StepIndicator.tsx`, `PasswordStrengthMeter.tsx`, `AuthCardLayout.tsx`, `GoogleAuthButton.tsx`.

The wizard calls `apiClient.checkUsernameAvailability()` live (`useRegisterWizard.ts:38`) before allowing continuation.

`GoogleAuthButton` is a **presentational button only** — it takes `onClick` as a prop and calls nothing. No OAuth provider is configured.

### 3.2 Feed & Search — 2 screens

| Route | File | Purpose | Data |
|---|---|---|---|
| `/feed` | `FeedPage.tsx` | **Member directory** | `ProfileDetailsResponse[]` |
| `/feed/search`, `/search` | `SearchResultsPage.tsx` | Profile search | `ProfileDetailsResponse[]` |

**Important: these screens are a member directory, not a post feed.** Both call `apiClient.getProfiles()` — the endpoint returning **every profile**. Cards are `MemberProfileCard.tsx`, with a `FeedSearchBar.tsx` for filtering.

**`getExplorePosts()` — the only post-discovery method in the client — has no call site anywhere in the UI.** It is defined in `apiClient.posts.ts:19` and implemented in `mockService.posts.query.ts:54`, but no screen, component, or hook calls it. See section 9.1.

`/explore` redirects to `/feed`, so there is no separate explore surface at all.

### 3.3 Posts — 3 screens (17 components)

| Route | File | Purpose | Data |
|---|---|---|---|
| `/`, `/studio`, `/posts/mine` | `StudioDashboardPage.tsx` | Manage own works | `PostSummaryResponse[]` |
| `/posts/new`, `/posts/:id/edit` | `PostEditorPage.tsx` | 4-step create/edit wizard | `Post`, `PostImage[]` |
| `/posts/:id` | `PostDetailsPage.tsx` | Public work view | `PostDetailsResponse` |

**Studio dashboard** — components: `StudioPostCard`, `StudioFilterBar`, `StudioDeleteModal`, `PostStatusBadge`.
Filter and sort are applied **client-side over the current page only** (the endpoint paginates at 10). This is existing behavior, not a bug to fix.

**Post editor** — 4-step wizard:

| Step | Component | Fields |
|---|---|---|
| Identity | `WizardStepIdentity.tsx` | title, externalUrl |
| Editorial | `WizardStepEditorial.tsx` | description, tags |
| Media | `WizardStepMedia.tsx` | images (`ImageDropzone`, `ImageReorderGrid`) |
| Review | `WizardStepReview.tsx` | preview |

Supporting: `WizardStepper`, `WizardBottomBar`.

**Post details** — two responsive implementations:
- `PostDetailDesktop.tsx` — primary image + secondary thumbnail strip
- `PostDetailMobile.tsx` — swipeable carousel
- `PostDetailPage.tsx:155` — falls back to `window.history.length > 2` for back navigation

Also: `PostLikeButton.tsx` (calls `toggleLikePost`), `PostCuratorialMeta.tsx` (renders tags), `PostCard.tsx`.

### 3.4 Profile — 3 screens (13 components)

| Route | File | Purpose | Data |
|---|---|---|---|
| `/u/:username` | `PublicProfilePage.tsx` | Public profile, 3 tabs | `PublicProfileResponse`, posts, career |
| `/profile/edit` | `EditProfilePage.tsx` | Edit own profile | `ProfileDetailsResponse` |
| `/profile/social-links` | `EditSocialLinksPage.tsx` | Manage social links | `SocialLink[]` |

**Public profile** (`PublicProfilePage.tsx:60-62`) loads three sources in parallel:

```ts
apiClient.getPublicProfile(username)
apiClient.getCreatorPosts(username, 1, PAGE_SIZE)
apiClient.getPublicCareer(username).catch(...)   // tolerant of failure
```

Infinite scroll on the works tab via `getCreatorPosts` with an incrementing page.

Tabs: `ProfileHeader.tsx` (avatar, names, specialty, badges, links), `ProfileAboutTab.tsx` (bio), `ProfileCareerTab.tsx` (career sections), `PostMasonryGrid.tsx`.

Editing: `BioEditor.tsx`, `SpecialtyPickerModal.tsx`, `AvatarUploader.tsx`.

Social links: `SocialLinksManager.tsx`, `AddSocialLinkForm.tsx`, `SocialLinkRow.tsx` (with reorder), `PlatformIcon.tsx`.

**`ReportProfileModal.tsx` exists but is not imported by any file.** It is dead code. See section 9.2.

### 3.5 Career — 13 screens (20 components)

The largest feature area. Six independent sections, each with a list, a form, and a shared card shell.

| Route | File | Purpose |
|---|---|---|
| `/career` | `CareerHubPage.tsx` | Summary + 6 navigation cards |
| `/career/experience` | `CareerExperiencePage.tsx` | Experience list |
| `/career/experience/new`, `/:id/edit` | `ExperienceFormPage.tsx` | Experience form |
| `/career/academics` | `CareerAcademicsPage.tsx` | Academics list |
| `/career/academics/new`, `/:id/edit` | `AcademicFormPage.tsx` | Academics form |
| `/career/skills` | `CareerSkillsPage.tsx` | Skills list |
| `/career/skills/new`, `/:id/edit` | `SkillFormPage.tsx` | Skills form |
| `/career/credentials` | `CareerCredentialsPage.tsx` | Credentials list |
| `/career/credentials/new`, `/:id/edit` | `CredentialFormPage.tsx` | Credentials form |
| `/career/languages` | `CareerLanguagesPage.tsx` | Languages list |
| `/career/languages/new`, `/:id/edit` | `LanguageFormPage.tsx` | Languages form |
| `/career/achievements` | `CareerAchievementsPage.tsx` | Achievements list |
| `/career/achievements/new`, `/:id/edit` | `AchievementFormPage.tsx` | Achievements form |

**Component pattern** — every section follows the same 4-part structure:

| Role | Component |
|---|---|
| List shell | `CareerListPage.tsx` (generic, reused by all 6) |
| Card | `ExperienceCard` / `AcademicCard` / `SkillCard` / `CredentialCard` / `LanguageCard` / `AchievementCard` |
| Card chrome | `CareerCardShell.tsx`, `CareerCardActions.tsx` (edit/delete) |
| Empty state | `CareerEmptyState.tsx` |
| Form | `ExperienceForm` / `AcademicForm` / `SkillForm` / `CredentialForm` / `LanguageForm` / `AchievementForm` |
| Delete confirm | `DeleteConfirmModal.tsx` |

Also: `CareerHubPage` + `CareerHeader.tsx` + `CareerNavCard.tsx` (the 6 section cards), `CareerActionLayout.tsx` (form page shell).

Data loading is standardized through the custom hook `useCareerCrud.ts` — one hook serving all six sections.

**Validation is minimal.** No career form sets `maxLength` or `pattern`. Dates are `YYYY-MM` strings per the type comments. Trim-non-empty is the only check.

### 3.6 Security & Settings — 8 screens (4 components)

| Route | File | Purpose | Data |
|---|---|---|---|
| `/settings`, `/settings/security` | `SecurityHubPage.tsx` | Security settings index | `CurrentUserResponse` |
| `/settings/security/change-password` | `ChangePasswordPage.tsx` | Change password | — |
| `/settings/security/email` | `UpdateEmailPage.tsx` | Change email | — |
| `/settings/security/username` | `ChangeUsernamePage.tsx` | Change username | — |
| `/settings/security/phone` | `ManagePhonePage.tsx` | Phone + account number | `phoneNumber`, `accountNumber` |
| `/settings/security/verification` | `VerificationRequestPage.tsx` | Request verification | `VerificationRequestDto` |
| `/settings/security/featured` | `FeaturedRequestPage.tsx` | Request featuring | `FeaturedRequestDto` |
| `/settings/security/delete-account` | `DeleteAccountPage.tsx` | Delete account | **None — no endpoint** |

`SecurityHubPage` is the index listing all settings with `SecurityNavRow.tsx` and the `SecurityActionLayout.tsx` shell.

The two request screens share one component, `StatusRequestPage.tsx`, parameterized by a `submitFn`. Both pass **only `message`, duplicated into `notes`**:

```ts
// VerificationRequestPage.tsx:14
submitFn={(message) => apiClient.submitVerificationRequest({ message, notes: message })}

// FeaturedRequestPage.tsx:14
submitFn={(message) => apiClient.submitFeaturedRequest({ message, notes: message })}
```

Consequence: the other five `VerificationRequestDto` fields — `category`, `identificationNumber`, `websiteUrl`, `portfolioUrl`, `documentUrl` — are **declared in the type but never populated by any screen**. See section 9.4.

`DeleteAccountPage` renders a confirmation but calls no endpoint. See section 9.2.

### 3.7 Notifications — 1 screen

| Route | File | Purpose | Data |
|---|---|---|---|
| `/notifications` | `NotificationsPage.tsx` | Broadcast announcements | `BroadcastAnnouncementItem[]` |

Filters: `all | announcements | warnings`. The `warnings` filter maps to `severity === "warning"`.

Two notable facts:

1. **There is no notifications data source.** The page calls `apiClient.getBroadcasts()`, which resolves through the client spread in `apiClient.ts:10-16` to `apiAdminClient.getBroadcasts()` — i.e. `GET /api/admin/broadcasts`, an **admin-namespaced** endpoint used by a user-facing screen.
2. **Read state is component-local.** `NotificationsPage.tsx:16` holds `readIds` in `useState<Set<string>>`. It is lost on reload and never sent anywhere.

Components: `NotificationCard.tsx`.

### 3.8 Admin — 8 screens (9 components)

All under `/admin`, wrapped by `AdminLayout` and `AdminRouteGuard`.

| Route | File | Purpose | Data |
|---|---|---|---|
| `/admin` | `AdminDashboardPage.tsx` | KPIs + recent activity | `AdminDashboardMetricsDto` |
| `/admin/users` | `AdminUsersPage.tsx` | User management | `AdminUserListItem[]` |
| `/admin/verifications` | `AdminVerificationsPage.tsx` | Verification queue | `VerificationRequestItem[]` |
| `/admin/reports` | `AdminReportsPage.tsx` | Report queue | `ContentReportItem[]` |
| `/admin/featured` | `AdminFeaturedPage.tsx` | Featured curation | `FeaturedRecommendationItem[]` |
| `/admin/storage` | `AdminStoragePage.tsx` | Storage telemetry | `StorageTelemetryDto` |
| `/admin/audit-logs` | `AdminAuditLogsPage.tsx` | Audit trail (read-only) | `AuditLogItem[]` |
| `/admin/broadcasts` | `AdminBroadcastsPage.tsx` | Announcements | `BroadcastAnnouncementItem[]` |

Components: `AdminKpiCard`, `AdminTable` (shared table), `StorageBarChart`, and four modals — `BanUserModal`, `VerificationReviewModal`, `ReportActionModal`, `BroadcastComposeModal`.

**Audit logs are read-only.** No admin screen creates or deletes an audit entry; writing is a backend-only responsibility.

### 3.9 System — 3 screens

| Route | File | Purpose |
|---|---|---|
| `/terms` | `TermsOfServicePage.tsx` | Static terms |
| `/privacy` | `PrivacyPolicyPage.tsx` | Static privacy policy |
| `/500` | `ServerErrorPage.tsx` | Server error |
| `*` | `NotFoundView.tsx` (shared) | 404 |

No backend requirement. `/500` implies a server-error path must be reachable.

---

## 4. Data Model

Six type definition files in `shared/types/`. **This is what the frontend models — not a database schema.**

### 4.1 Enumerations

| Enum | Values | Location |
|---|---|---|
| `PostStatus` | `Draft: 0`, `Published: 1`, `Unpublished: 2` | `post.ts:3-17` |
| `VerificationStatus` | `"none" \| "pending" \| "verified" \| "rejected"` | `common.ts:21` |
| `FeaturedStatus` | `"none" \| "pending" \| "featured" \| "rejected"` | `profile.ts:26` |
| `UserRole` | `"Admin" \| "Creator" \| "Curator"` | `admin.ts:1` |
| `UserStatus` | `"active" \| "suspended" \| "pending_review"` | `admin.ts:2` |
| `SkillCategory` | `Technical \| Design \| Leadership \| Tools \| General` | `career.ts:36` |
| `LanguageProficiency` | `Native \| Fluent \| Professional \| Intermediate \| Basic` | `career.ts:57` |
| `ReportReason` | `copyright \| impersonation \| inappropriate \| spam \| other` | `admin.ts:43` |
| `BroadcastScope` | `all_users \| creators_only \| direct_user` | `admin.ts:111` |
| `BroadcastSeverity` | `info \| update \| contest \| warning` | `admin.ts:113` |
| `AuditAction` | 9 fixed values (see 4.11) | `admin.ts:90-99` |

**There is no `Archived` post state.** The studio status filter offers only the three above plus `"all"`.

### 4.2 User account

```ts
UserAccount {
  id, email, username, profileId,
  roles: string[],
  phoneNumber?, accountNumber?,
  isVerified?, verificationStatus?,
  featuredStatus?, isBanned?, banReason?
}

UserIdentityDetails { id, email, username, roles }

CurrentUserResponse {
  id, email, username, firstName, lastName, profileId,
  bio?, avatarUrl?, phoneNumber?, accountNumber?,
  isVerified?, verificationStatus?, featuredStatus?,
  isBanned?, banReason?, roles
}
```

Identity and profile are modeled separately (`UserIdentityDetails` vs `Profile`); `CurrentUserResponse` is the join used by the UI.

`phoneNumber` and `accountNumber` appear on the user **and** profile types, and both are echoed in `CurrentUserResponse` — the authenticated-user payload.

### 4.3 Profile

```ts
Profile {
  id, userId, username, email,
  firstName, lastName,
  specialty?, bio?,
  avatarKey?, avatarUrl?,
  phoneNumber?, accountNumber?,
  isVerified?, verificationStatus?, featuredStatus?,
  createdAt, updatedAt?,
  socialLinks: SocialLink[]
}
```

**Three distinct response shapes** — the distinction is deliberate:

| Type | Contains | Used by |
|---|---|---|
| `ProfileDetailsResponse` | Everything incl. `email`, `avatarKey`, `createdAt` | Owner view |
| `MyProfileResponse` | Alias of the above | Owner view |
| `PublicProfileResponse` | No `email`, no `avatarKey`, no timestamps | Public view |

`username` is denormalized onto the profile even though the account also carries it.

### 4.4 Social link

```ts
SocialLink { id, profileId, platform, url, displayOrder }
```

`platform` is a **free-form string** — not an enum. `displayOrder` is user-controlled and set via a bulk reorder operation.

### 4.5 Post

```ts
Post {
  id, profileId, title, description, externalUrl?,
  status: PostStatus, tags?: string[],
  likeCount?, isLiked?,
  createdAt, publishedAt?, updatedAt?,
  images: PostImage[]
}
```

**Posts belong to a `profileId`, not a user.** Ownership resolves through profile ownership.

Two fields are **viewer-relative read-model values, not stored data:**
- `isLiked` — true only for the requesting viewer
- `likeCount` — aggregate

Two fields on the summary type are **derived**, not stored:
- `thumbnailUrl` — implies generated image variants; nothing produces it
- `imageCount` — count of `images`

`PostCreatorDto` embedded in post responses carries `profileId, username, firstName, lastName, avatarUrl, bio, isVerified` — enough to render an author card without a second request.

`tags` is `string[]`. Order is not semantic anywhere in the UI.

### 4.6 Post image

```ts
PostImage { id, postId, storageKey, url, displayOrder, createdAt }
```

Both `storageKey` and `url` are stored and returned. `storageKey` is the durable reference; `url` is a resolvable location. The frontend writes `storageKey` and expects `url` back.

### 4.7 Career — six entities

All keyed to the profile; all carry `id` + `createdAt`. Dates are `YYYY-MM`.

| Entity | Fields beyond `id`/`createdAt` |
|---|---|
| `CareerExperience` | `company`, `jobTitle`, `startDate`*, `endDate`, `currentlyWorking`, `employmentType`, `location`, `description`, `achievements`, `skillsUsed[]` |
| `CareerAcademic` | `institution`, `degree`, `fieldOfStudy`, `startDate`*, `endDate`, `currentlyStudying`, `location`, `description`, `gpa`, `achievements` |
| `CareerSkill` | `name`, `category?` |
| `CareerCredential` | `name`, `issuingOrganization`, `issueDate`, `expirationDate`, `credentialId`, `verificationUrl`, `mediaUrl` |
| `CareerLanguage` | `language`, `proficiency` |
| `CareerAchievement` | `title`, `type`, `date`, `organization`, `description`, `url`, `mediaUrl` |

\* Required in the type.

**No lifecycle** — no status field on any career entity. Create, read, update, delete only.

`mediaUrl` on credentials and achievements are **plain URL strings with no upload flow** — there is no career `upload-url` endpoint anywhere, unlike avatar and post images.

`CareerLanguage.proficiency` is typed `LanguageProficiency | string`, which **defeats the union** and makes the enum unenforceable at compile time.

### 4.8 Career visibility and summary

```ts
CareerVisibilitySettings {
  experience, academics, skills, credentials, languages, achievements: boolean   // 6 flags
}

CareerSummary { experienceCount, academicsCount, skillsCount,
                credentialsCount, languagesCount, achievementsCount }

PublicCareerData { visibility: CareerVisibilitySettings, experiences[], academics[],
                   skills[], credentials[], languages[], achievements[] }
```

`PublicCareerData` bundles the settings object **alongside** the records, so visibility is expected to be enforced server-side on the public read — the client cannot filter what it was not sent.

### 4.9 Moderation request entities

| Entity | Fields |
|---|---|
| `VerificationRequestDto` (submit) | `message?`, `notes?`, `category?`, `identificationNumber?`, `websiteUrl?`, `portfolioUrl?`, `documentUrl?` |
| `VerificationRequestItem` (admin read) | `id`, `userId`, `username`, `fullName`, `avatarUrl`, `message`, `notes`, `status: pending\|approved\|rejected`, `postsCount`, `submittedAt`, `decisionNote` |
| `ContentReportItem` | `id`, `reporterId`, `reporterUsername`, `targetType: post\|user`, `targetId`, `targetTitle`, `targetAuthorUsername`, `reason`, `details`, `status: pending\|resolved\|dismissed`, `createdAt`, `actionTaken` |
| `FeaturedRequestDto` (submit) | `message`, `notes?` |
| `FeaturedRecommendationItem` (admin read) | `id`, `userId`, `username`, `fullName`, `avatarUrl`, `headline`, `message`, `isCuratedPinned`, `status: none\|pending\|featured\|rejected`, `submittedAt` |

**Asymmetry worth noting:** the verification submit type has 5 evidence fields the admin read type lacks, and the featured admin read type has a `headline` field the submit type never sends. See section 9.4.

`ContentReportItem` is **admin-read only** — no screen submits a report. See section 9.2.

### 4.10 Storage telemetry

```ts
StorageTelemetryDto {
  totalCapacityBytes, usedBytes, totalFilesCount,
  monthlyBandwidthBytes, requestsCount,
  breakdown: { imagesBytes, documentsBytes, thumbnailsBytes },
  topConsumers: StorageConsumerItem[]   // { userId, username, fullName, avatarUrl, bytesUsed, filesCount }
}
```

Requires accounting across **users, file types, and time** (monthly bandwidth, request counts) — not just a stored-bytes total.

### 4.11 Audit log

```ts
AuditLogItem {
  id, adminId, adminUsername,
  action: "user_banned" | "user_unbanned"
        | "verification_approved" | "verification_rejected"
        | "post_hidden" | "featured_pinned" | "featured_unpinned"
        | "broadcast_sent" | "role_modified",
  targetId, targetLabel, reason?, timestamp, metadata?
}
```

A **closed 9-value set**. Read-only from the frontend — no create or delete method exists. Every admin action maps to one entry, except `post_hidden`, which has **no call site** (section 9.2).

### 4.12 Broadcast announcement

```ts
BroadcastAnnouncementItem {
  id, title, message,
  scope: "all_users" | "creators_only" | "direct_user",
  targetUserId?, severity: "info" | "update" | "contest" | "warning",
  publishedAt, adminUsername
}
```

`direct_user` + `targetUserId` implies per-recipient delivery, but **no per-recipient read state is modeled anywhere** (section 9.5).

### 4.13 Infrastructure types

```ts
PaginatedList<T> { items, pageNumber, pageSize, totalCount,
                   totalPages, hasPreviousPage, hasNextPage }   // pageNumber is 1-based

ProblemDetails { type?, title?, status?, detail?, instance?,
                 errors?: Record<string, string[]> }           // RFC 7807-style

ReorderItem { id, displayOrder }
UploadUrlRequest { contentType, fileSizeBytes }
UploadUrlResponse { uploadUrl, storageKey }
```

`ProblemDetails.errors` supports field-level validation messages. `PaginatedList` returns 6 fields, 3 of which are derivable — all 6 are required by the type.

### 4.14 Entity relationships

```
UserAccount ──1:1──> Profile ──1:N──> SocialLink
                        │
                        ├──1:N──> Post ──1:N──> PostImage
                        │
                        ├──1:N──> CareerExperience
                        ├──1:N──> CareerAcademic
                        ├──1:N──> CareerSkill
                        ├──1:N──> CareerCredential
                        ├──1:N──> CareerLanguage
                        ├──1:N──> CareerAchievement
                        │
                        ├──1:1──> CareerVisibility (6 flags)
                        ├──1:N──> VerificationRequest
                        └──1:N──> FeaturedRequest

ContentReport ──polymorphic──> Post | User
AuditLog       ──polymorphic──> target
```

### 4.15 Data the frontend does NOT model

| Missing | Consequence |
|---|---|
| `PostLike` | `toggleLikePost` returns `{isLiked, likeCount}` but no like entity exists |
| `Notification` | No entity; the page renders broadcasts |
| Per-recipient broadcast read state | `direct_user` scope is unaddressable |
| `ProfileVisit` / view counter | No view tracking anywhere |
| Tag or category entity | `category` is sent as a post filter but no field backs it |
| Refresh token / session entity | Tokens are opaque strings in `localStorage` |
| Role / permission entity | Roles are bare strings |
| Comment, follower, message | Not a social network — correctly absent |

---

## 5. Data Flows

### 5.1 File upload — the only 3-step flow

Identical for avatar and post images:

```
1. POST .../upload-url   { contentType, fileSizeBytes }
                        → { uploadUrl, storageKey }
2. PUT  <uploadUrl>      <raw file bytes>        ← direct to storage, no auth
3. POST/PUT ...          { storageKey }           ← registers the reference
```

Step 2 uses **bare `fetch`**, not `httpFetch` (`apiClient.posts.ts:146-152`) — no `Authorization` header, only `Content-Type`. This is a pre-signed URL flow.

`storageKey` is issued **before** the file is uploaded, so the backend must generate and reserve it. `fileSizeBytes` and `contentType` are available at step 1 for validation before any bytes are accepted.

Affected screens: `AvatarUploader`, `AvatarUploadStep`, `ImageDropzone`, `PostEditorPage` (media step).

### 5.2 Session restore

```
App mount
  → AuthContext
  → apiClient.getCurrentUser()
      → tokenStorage.getToken() → Authorization: Bearer
      → GET /api/auth/me
      → on ANY error: null (treated as logged out)
```

No refresh-on-401 exists. A 401 and a 500 both produce the same result.

### 5.3 Public profile load

```
PublicProfilePage mounts
  ├─ getPublicProfile(username)          → PublicProfileResponse
  ├─ getCreatorPosts(username, 1, 12)   → PaginatedList<PostSummaryResponse>
  └─ getPublicCareer(username)          → PublicCareerData   [.catch tolerated]

Scroll to bottom
  └─ getCreatorPosts(username, nextPage, 12)   → append
```

The `.catch` on career means a failure there degrades to an empty career tab rather than an error state.

### 5.4 Registration

```
RegisterWizard
  → step 1: checkUsernameAvailability(username)  [live, blocks progression]
  → step 2: personal info
  → step 3: optional avatar (3-step upload)
  → step 4: review
  → register({ email, username, password, firstName, lastName, bio?, avatarUrl? })
  → AuthResponse { accessToken, refreshToken, expiry? }
  → tokens to localStorage, profile created implicitly
```

Registration implies profile creation in one call — no separate "create profile" step exists anywhere.

### 5.5 Post lifecycle

```
createPost → status = Draft (never implicitly published)
editPost   → content only; status unchanged
publish    → status = Published, publishedAt set if null
unpublish  → status = Unpublished, publishedAt retained
delete     → post + all images removed
```

The editor's Review step shows a preview; status is controlled from the studio dashboard, not the editor.

### 5.6 Studio filtering — client-side

```
GET /api/posts/mine?status&pageNumber&pageSize   (pageSize = 10)
  → useState: search text, status tab, sort order
  → filterAndSort posts in the browser
  → render
```

Search, status filter, and sort all operate on **the current 10-item page**. The backend is not asked to handle any of them.

### 5.7 Pagination usage

| Call | `pageSize` |
|---|---|
| `getExplorePosts` | 12 (unused) |
| `getCreatorPosts` / `getProfilePosts` | 12, infinite scroll |
| `getMyPosts` | 10 |

All five admin list endpoints take **no pagination at all** and expect bare arrays.

### 5.8 Auth-protected writes

Every mutating call relies solely on the bearer token. Ownership is never sent by the client — the server must derive it from the token's profile.

---

## 6. Mock Data Layer

24 files in `shared/api/`. Active whenever `USE_MOCK_API` is true (the default).

### 6.1 Structure

| File | Role |
|---|---|
| `mockDb.ts` | In-memory store + `localStorage` persistence |
| `mockCrudFactory.ts` | Generic CRUD generator |
| `mockData.ts`, `mockData.admin.ts`, `mockData.posts.ts`, `mockData.profiles.ts`, `mockData.users.ts` | Seed data |
| `mockService.ts` | Facade re-exported by the API clients |
| `mockService.auth.ts` | Auth, personas, reset |
| `mockService.profile.ts` | Profile, social links, verification, featured |
| `mockService.posts.ts` | Facade |
| `mockService.posts.command.ts` | Post mutations, likes |
| `mockService.posts.query.ts` | Post reads, explore, pagination |
| `mockService.admin.ts` | All 19 admin operations |
| `careerMockData.ts` | Career seed data |
| `careerMockService.ts` | All career operations |

### 6.2 Mock state controls

`apiAuthClient` exposes three mock-only methods with **no real API path**:

| Method | Effect |
|---|---|
| `getActivePersona()` | Returns `visitor \| creator \| admin` |
| `switchPersona(p)` | Writes `showcase_active_persona` |
| `resetDatabase()` | Clears the mock store |

### 6.3 What the mock layer determines

Because mocks are the default, the **mock service is the de-facto specification of runtime behavior** until mocks are disabled:

- Which validations actually fire (the forms themselves validate almost nothing)
- Which status codes are returned
- What `localStorage` keys persist and in what shape
- Persona switching, which has no real equivalent
- Audit entries generated as a side effect of admin actions

**The risk:** mock behavior and the existing backend have never been reconciled, because nothing forces them to meet. See section 9.

---

## 7. Shared Building Blocks

### 7.1 Components (14)

| Component | Purpose |
|---|---|
| `Button.tsx` | Primary action element |
| `Input.tsx` | Text input |
| `Textarea.tsx` | Multi-line input |
| `Toggle.tsx` | Switch control — used for career visibility |
| `Modal.tsx` | Dialog base |
| `Badge.tsx` | Status pill — post status, severity |
| `VerifiedBadge.tsx` | Verification indicator |
| `Skeleton.tsx` | Loading placeholder |
| `EmptyState.tsx` | No-data state |
| `ErrorBanner.tsx` | Error surface — consumes `ProblemDetails` |
| `Lightbox.tsx` | Full-screen image viewer |
| `BrandLogo.tsx` | Logo |
| `NotFoundView.tsx` | 404 screen |
| `VisitorGuard.tsx` | Detects logged-in visitors on creator routes |

### 7.2 Hooks (9)

| Hook | Purpose |
|---|---|
| `useAsyncData.ts` | Fetch + `{ data, isLoading, error }` — the data layer, no library |
| `useCareerCrud.ts` | Career list/create/update/delete, shared by all 6 sections |
| `useAuth.ts` | Auth context consumer |
| `useToast.ts` | Toast context consumer |
| `useResponsiveViewport.ts` | Breakpoint detection — picks desktop vs mobile post view |
| `useAdaptiveImageDimensions.ts` | Image sizing per viewport |
| `useMediaQuery.ts` | Media query primitive |
| `useScrollLock.ts` | Body scroll lock for modals |
| `useEscapeKey.ts` | Escape-to-close for modals |

### 7.3 Contexts (2)

`AuthContext` — session, profile, roles, persona (section 2.4).
`ToastContext` — transient notifications.

### 7.4 Utilities

`shared/utils/format.ts` — date and display formatting.

---

## 8. Validation Rules

Only **three** validation rules exist in the entire frontend, and all are in the post editor.

| Field | Rule | Location |
|---|---|---|
| `Post.description` | `maxLength={2000}` | `WizardStepEditorial.tsx:46` |
| `Post.tags` | max 10, duplicates unselectable | `WizardStepEditorial.tsx:55,74,97` |
| Career dates | `YYYY-MM` format | `career.ts` type comments only |

**Everything else is unvalidated.** Notably:

- **`Post.title` has no `maxLength` and no `minLength`** — the most prominent field on a post is unbounded in the UI
- No career form sets `maxLength` or `pattern`; trim-non-empty is the only check
- No username, email, or password format validation outside the live availability check
- `bio` and `specialty` are unbounded
- Social-link `platform` accepts any string
- `externalUrl` is not validated as a URL

---

## 9. Findings

Issues found while mapping the frontend. Each is stated with evidence; none is fixed here.

### 9.1 Dead API methods

Defined in the client and implemented in mock services, but **never called by any screen, component, or hook**:

| Method | Endpoint | Effect |
|---|---|---|
| `getExplorePosts()` | `GET /api/posts/explore` | The **only** post-discovery method in the app — unused |

Consequence: there is no post feed in the product. The `/feed` screen is a member directory, `/explore` redirects to `/feed`, and search operates on profiles. The `search` and `category` parameters, and the 12-item post pagination, are entirely unexercised.

### 9.2 UI without a data path

Components and screens that exist but call nothing:

| Item | Location | Consequence |
|---|---|---|
| `ReportProfileModal.tsx` | `profile/components/` | **Not imported by any file** — dead component. A report can never be created. |
| `DeleteAccountPage` | `security/pages/` | Confirmation UI, no endpoint |
| `GoogleAuthButton` | `auth/components/` | Presentational; `onClick` calls nothing |
| `CompleteOAuthPage` | `auth/pages/` | Callback screen, no provider |
| `post_hidden` audit action | `admin.ts:95` | Declared in the enum, no call site |
| `/settings/security/two-factor` | route | Redirects to `/settings/security` — feature absent |
| `/settings/security/sessions` | route | Redirects to `/settings/security` — feature absent |

### 9.3 Error handling gaps

| Issue | Location | Effect |
|---|---|---|
| `getCurrentUser` swallows all errors | `apiClient.auth.ts:58-62` | A 500 is indistinguishable from logged-out |
| No refresh-on-401 | `httpFetch` | An expired access token ends the session with no recovery |
| `PublicProfilePage` career `.catch` | line 62 | Career failure silently degrades to an empty tab |
| Non-JSON error body | `apiClient.base.ts:32` | Degrades to `{ title, status }` — not a `ProblemDetails` |

### 9.4 Type fields that are never populated

Declared in types, but no screen supplies a value:

| Type | Orphan fields |
|---|---|
| `VerificationRequestDto` | `category`, `identificationNumber`, `websiteUrl`, `portfolioUrl`, `documentUrl` |
| `FeaturedRecommendationItem` | `headline` (admin reads it; the submit type never sends it) |
| `VerificationRequestItem` | admin read model has **none** of the 5 evidence fields above |
| `PostSummaryResponse` | `thumbnailUrl` — no producer anywhere |

The verification evidence gap is the notable one: applicants could submit evidence that administrators are structurally unable to see.

### 9.5 Data the UI cannot hold

| Gap | Consequence |
|---|---|
| Notification read state | `useState<Set<string>>` in `NotificationsPage.tsx:16` — lost on reload, never persisted |
| Per-recipient broadcasts | `scope: "direct_user"` + `targetUserId` has no read-state model |
| Likes | `PostLikeButton` calls `toggleLikePost`, but no like entity is modeled and no like count renders in a list |

### 9.6 Privacy concern in the contract

`apiProfileClient.getProfiles()` calls `GET /api/profiles` with `requiresAuth: false` and expects `ProfileDetailsResponse[]` — the **owner's** response shape, which includes `email`, `avatarKey`, `phoneNumber`, `accountNumber`, and timestamps.

**Both `/feed` and `/feed/search` call this method.** If the endpoint honored the frontend's expectation, every anonymous visitor would receive every user's email address. See section 4.3 for the deliberate three-shape distinction this bypasses.

Additionally, `phoneNumber` and `accountNumber` appear in `PublicProfileResponse` — meaning a phone number would be public on every profile. Neither field has a documented purpose; `accountNumber` is not read, validated, or displayed anywhere.

### 9.7 Architecture note

`NotificationsPage` (user-facing) reads `GET /api/admin/broadcasts` (admin-namespaced) because `apiClient.ts:10-16` spreads all five feature clients into one flat object. The notifications screen therefore depends on an admin endpoint for user-facing content, and will receive `401`/`403` the moment mocks are disabled and real authorization applies.

### 9.8 Architectural strength

`apiClient.ts` merges five feature clients into one flat namespace. This is why `NotificationsPage` can accidentally call an admin method, and why `getBroadcasts` appears to be a general-purpose method. Feature clients are cleanly separated internally; only the merge discards that separation. A namespaced accessor (`apiClient.admin.getBroadcasts()`) would have prevented 9.7.

---

## 10. Summary Tables

### 10.1 Screens by feature

| Feature | Screens | Components | Data domain |
|---|---|---|---|
| Auth | 3 | 7 | `UserAccount`, `Profile` |
| Feed & Search | 2 | 2 | `Profile[]` (directory) |
| Posts | 3 | 17 | `Post`, `PostImage` |
| Profile | 3 | 13 | `Profile`, `SocialLink`, posts, career |
| Career | 13 | 20 | 6 career entities + visibility |
| Security | 8 | 4 | `UserAccount`, verification, featured |
| Notifications | 1 | 1 | `BroadcastAnnouncement[]` |
| Admin | 8 | 9 | all moderation + telemetry + audit |
| System | 3 | 0 | static |
| **Total** | **44** | **73** | |

*(46 total page components including the 2 generic career list wrappers and shared 404; 93 feature components including non-page entries.)*

### 10.2 API methods by feature

| Client | Methods | Backend status |
|---|---|---|
| `apiAuthClient` | 11 (8 real + 3 mock-only) | 8 implemented |
| `apiProfileClient` | 14 | 7 implemented |
| `apiPostsClient` | 15 | 12 implemented |
| `apiCareerClient` | 28 | 0 implemented |
| `apiAdminClient` | 19 | 0 implemented |
| **Total** | **87** | **27** |

### 10.3 Data entities

| # | Entity | Type file | Implemented in backend |
|---|---|---|---|
| 1 | `UserAccount` | `security.ts` | Yes |
| 2 | `Profile` | `profile.ts` | Yes |
| 3 | `SocialLink` | `profile.ts` | Yes |
| 4 | `Post` | `post.ts` | Yes |
| 5 | `PostImage` | `post.ts` | Yes |
| 6 | `CareerExperience` | `career.ts` | No |
| 7 | `CareerAcademic` | `career.ts` | No |
| 8 | `CareerSkill` | `career.ts` | No |
| 9 | `CareerCredential` | `career.ts` | No |
| 10 | `CareerLanguage` | `career.ts` | No |
| 11 | `CareerAchievement` | `career.ts` | No |
| 12 | `CareerVisibilitySettings` | `career.ts` | No |
| 13 | `VerificationRequest` | `profile.ts` / `admin.ts` | No |
| 14 | `FeaturedRequest` | `profile.ts` / `admin.ts` | No |
| 15 | `ContentReport` | `admin.ts` | No |
| 16 | `AuditLog` | `admin.ts` | No |
| 17 | `BroadcastAnnouncement` | `admin.ts` | No |

**5 of 17 modeled entities are implemented in the backend.** All 12 career and moderation entities exist only in frontend types and mock data.

---

### Document Confidence

| Area | Confidence | Basis |
|---|---|---|
| Routes, screen files, component inventory | **High** | Read directly from `App.tsx` and the file tree |
| Type shapes and field lists | **High** | Read directly from the 6 type files |
| API contracts (79 methods) | **High** | Read directly from the 5 client files |
| Data flows | **High** | Traced through components |
| Validation rules | **High** | Only 3 exist; each located by line |
| Mock behavior | **Medium** | Read from source, not executed |
| Runtime data shapes | **Low** | Mocks never executed; backend never exercised |
| Section 9 findings | **High** | Each verified by call-site search |

**Strongest evidence:** the 5 API client files and 6 type files form a complete, explicit contract. **Weakest:** anything about actual runtime behavior — mocks default to on and were never run against the backend, so no statement here is confirmed by observation.

**Not verified:** no code was executed. Runtime behavior, mock output, and real API responses were not observed. Section 9 findings are all static-analysis results from call-site searches, not runtime reproductions.
