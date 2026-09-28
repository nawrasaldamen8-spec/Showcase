# Pority — Backend Requirements Specification

> **Document type:** Requirements discovery. Derived by reverse-engineering the existing `Showcase.ClientApp` frontend.
> **This document describes what the backend must do. It is not an implementation plan, and no code was written or modified to produce it.**
> **Status:** Draft for product review.

---

## 1. Executive Summary

**Pority is a personal web-presence and portfolio platform.** An individual (the "creator") maintains a public profile containing biographical information, social links, a body of creative work, and a structured career history. Visitors browse public profiles and content. Administrators moderate the platform.

**Pority is not a social network.** There is no follower graph, no friend graph, no direct messaging, no commenting, and no activity feed built from user-to-user interactions. The "feed" is a discovery surface over published work and profiles. Likes on a post are the only user-to-content interaction, and they exist to rank work — not to build a social identity. Any backend design that introduces social-graph primitives is out of scope.

### Current repository state — important correction

The original task premise stated the backend was unimplemented. **That is not accurate.** The repository already contains a partially-built .NET 10 backend:

| Area | Frontend contract exists | Backend implemented |
|---|---|---|
| Auth | Yes (8 operations) | **Yes** (8 endpoint files) |
| Posts | Yes (14 operations) | **Yes** (12 endpoint files) |
| Profiles | Yes (13 operations) | **Yes** (7 endpoint files) |
| Social Links | Yes (5 operations) | **Yes** (4 endpoint files) |
| Career | Yes (28 operations) | **No** — no endpoints, no domain entities |
| Admin | Yes (19 operations) | **No** — no endpoints, no domain entities |
| Notifications | No contract | **No** |

195 `.cs` files exist across four layers (`Showcase.Domain` 22, `Showcase.Application` 102, `Showcase.Infrastructure` 26, `Showcase.Api` 45). Domain entities `Post`, `PostImage`, `Profile`, `SocialLink` and the `PostStatus` enum already exist, alongside `Bio`, `StorageKey`, `Url` value objects and a `Result`/`Error` return type.

**Consequence for this document:** sections 1–12 describe the complete target backend, derived from frontend behavior. Section 13 onward additionally records which requirements are already satisfied by the existing implementation and which are genuine gaps. Requirements already implemented are marked `EXISTING`; requirements with no backend are marked `GAP`. Two live contract defects were found and are recorded in section 19 rather than silently resolved.

### The single most important integration fact

`apiClient.base.ts:3` reads:

```ts
export const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API !== "false";
```

Mocks are **on by default** and the comparison is a strict string match against `"false"`. No `.env` file is committed. Until `VITE_USE_MOCK_API=false` is set explicitly, **zero requests reach the real backend** and the entire application runs against `localStorage`-backed mocks. Every requirement in this document is therefore currently unverified against the live API, and a first integration step must exist to switch modes and surface the accumulated drift.

---

## 2. Frontend Capability Inventory

Derived from `src/app/App.tsx` route table, the five API clients, and the feature directory tree. "Contract" means a real HTTP call is wired in the non-mock branch.

### 2.1 Authentication and account

| Capability | Route | Contract | Notes |
|---|---|---|---|
| Register | `/register` (`RegisterWizardPage`) | Yes | Wizard; collects email, username, password, names, optional bio |
| Login | `/login` (`LoginPage`) | Yes | Accepts email **or** username in one field |
| Logout | — | Yes | No dedicated route |
| Current user | — | Yes | Hydrates `AuthContext`; returns `null` on any error |
| Username availability | — | Yes | Pre-registration check |
| Change password | `/settings/security/change-password` | Yes | Requires current password |
| Change email | `/settings/security/email` | Yes | Requires current password |
| Change username | `/settings/security/username` | Yes | Requires current password |
| OAuth completion | `/auth/complete-oauth` (`CompleteOAuthPage`) | **No** | Page exists; no provider, no callback contract |
| Two-factor | `/settings/security/two-factor` | **No** | Redirects to `/settings/security` |
| Session management | `/settings/security/sessions` | **No** | Redirects to `/settings/security` |
| Delete account | `/settings/security/delete-account` | **No** | Page exists; no endpoint called |

### 2.2 Profile

| Capability | Route | Contract | Notes |
|---|---|---|---|
| Edit profile | `/profile/edit` | Yes | Names, specialty, bio, phone, account number |
| Social links CRUD | `/profile/social-links` | Yes | Add, update, delete, reorder |
| Public profile | `/u/:username` | Yes | `PublicProfileResponse` |
| Own profile fetch | — | Yes | `ProfileDetailsResponse` |
| All profiles list | — | Yes | Anonymous; see section 7 privacy flag |
| Avatar upload | — | Yes | 3-step: get URL → direct PUT → register key |
| Avatar remove | — | Yes | |
| Manage phone / account number | `/settings/security/phone` | Yes | Separate endpoint from profile update |
| Submit verification request | `/settings/security/verification` | Yes | Optional evidence fields |
| Submit featured request | `/settings/security/featured` | Yes | Requires `message` |

### 2.3 Works (posts)

| Capability | Route | Contract | Notes |
|---|---|---|---|
| Studio dashboard | `/`, `/studio`, `/posts/mine` (all same page) | Yes | Three route aliases, one screen |
| Create / edit work | `/posts/new`, `/posts/:id/edit` | Yes | Shared `PostEditorPage` |
| Work details | `/posts/:id` | Yes | Public |
| Publish | — | Yes | From studio |
| Unpublish | — | Yes | From studio |
| Delete | — | Yes | From studio |
| Image upload / add / remove / reorder | — | Yes | Full 4-step management |
| Like toggle | — | Yes | **No backend endpoint** |
| Explore / feed | `/feed` | Yes | `GET /api/posts/explore` |
| Search results | `/feed/search`, `/search` | Yes | Two aliases, one screen |
| Profile works | — | Yes | `GET /api/profiles/{username}/posts` |

`/explore` redirects to `/feed`. There is no distinct explore product.

### 2.4 Career

Six independent sections, each with list/create/edit/delete, plus a summary endpoint, a visibility setting, and a public read. 28 operations total.

| Section | List route | Form routes | Contract |
|---|---|---|---|
| Hub | `/career` | — | Yes (summary) |
| Experience | `/career/experience` | `.../new`, `.../:id/edit` | Yes |
| Academics | `/career/academics` | `.../new`, `.../:id/edit` | Yes |
| Skills | `/career/skills` | `.../new`, `.../:id/edit` | Yes |
| Credentials | `/career/credentials` | `.../new`, `.../:id/edit` | Yes |
| Languages | `/career/languages` | `.../new`, `.../:id/edit` | Yes |
| Achievements | `/career/achievements` | `.../new`, `.../:id/edit` | Yes |
| Visibility | — | — | Yes (3 operations) |
| Public read | — | — | Yes (2 operations) |

**Confirmed gap: the backend implements none of this.** There is no `Showcase.Api/Endpoints/Career` directory and no career entity in `Showcase.Domain`.

### 2.5 Administration

Eight screens under `/admin`, 19 operations. **Confirmed gap: the backend implements none of this.**

| Screen | Route | Operations |
|---|---|---|
| Dashboard | `/admin` | 1 (metrics) |
| Users | `/admin/users` | 4 (list, ban, unban, set roles) |
| Verifications | `/admin/verifications` | 3 (list, approve, reject) |
| Reports | `/admin/reports` | 3 (list, resolve, dismiss) |
| Featured | `/admin/featured` | 4 (list, pin/unpin, approve, reject) |
| Storage | `/admin/storage` | 1 (telemetry) |
| Audit logs | `/admin/audit-logs` | 1 (list, **read-only**) |
| Broadcasts | `/admin/broadcasts` | 2 (list, create) |

### 2.6 Notifications

`/notifications` (`NotificationsPage`) exists and filters by `all | announcements | warnings`. **There is no notifications API client** — no `apiClient.notifications.ts` exists.

The page calls `apiClient.getBroadcasts()`, which resolves through the spread in `apiClient.ts:10-16` to **`apiAdminClient.getBroadcasts()` → `GET /api/admin/broadcasts`**. A user-facing screen therefore reads from an admin-namespaced endpoint. Read state is `useState<Set<string>>` in component state only.

### 2.7 Static and error pages

`/terms`, `/privacy`, `/500`, `*` (not found). Static content; no backend requirement. `/500` implies a server-error path must be reachable.

---

## 3. Persistent Data Model Discovery

Only entities whose persistence semantics are unambiguous are listed. This is **not** a table schema — that belongs to section 17 and requires decisions recorded in section 19.

### 3.1 User account

Identity and profile are separate concerns in the frontend contracts: `UserIdentityDetails` carries `id, email, username, roles`, while `Profile` carries `userId` plus all personal data. `CurrentUserResponse` joins both, and `UserAccount` adds `profileId` plus profile-owned moderation fields.

Fields: `id`, `email`, `username`, `passwordHash` (never exposed), `profileId`, `roles[]`, `isBanned`, `banReason`.

`isBanned` and `banReason` appear on `UserAccount` and `CurrentUserResponse` — the platform self-reports ban state to the user. `UserStatus` (`active | suspended | pending_review`) exists in the admin types and is a **separate concept** from the boolean `isBanned`; whether both are stored is undecided.

### 3.2 Profile

`id`, `userId`, `username` (denormalized onto profile), `email`, `firstName`, `lastName`, `specialty`, `bio`, `avatarKey`, `avatarUrl`, `phoneNumber`, `accountNumber`, `isVerified`, `verificationStatus`, `featuredStatus`, `createdAt`, `updatedAt`.

`email` is present on `Profile` and `ProfileDetailsResponse` but **absent from `PublicProfileResponse`**. The distinction between the three response shapes is deliberate and must be preserved by the backend.

### 3.3 Social link

`id`, `profileId`, `platform` (free-form string, not an enum), `url`, `displayOrder`. `displayOrder` is user-controlled and reordered via a bulk operation.

### 3.4 Post

`id`, `profileId`, `title`, `description`, `externalUrl`, `status`, `tags[]`, `likeCount`, `isLiked`, `createdAt`, `publishedAt`, `updatedAt`, `images[]`.

- Posts belong to a **profile**, not a user. Ownership resolves through profile ownership.
- `likeCount` and `isLiked` are **viewer-relative**: `isLiked` is true only for the requesting viewer. This is a read-model concern, not a column on Post.
- `tags` is `string[]` — the shape implies either a Postgres array column, a join table, or JSONB. The frontend treats tags as a flat ordered list, so **order is not semantic**.
- `publishedAt` is set on first publish and retained after unpublish.
- `thumbnailUrl` and `imageCount` on `PostSummaryResponse` are **derived/denormalized read fields**, not stored columns.

### 3.5 Post image

`id`, `postId`, `storageKey`, `url`, `displayOrder`, `createdAt`. `storageKey` is the durable reference; `url` is a derived, resolvable location. Both are returned, and the backend must define their relationship (see section 8).

### 3.6 Career entities

Six homogeneous record types, all keyed to the profile and all carrying `id` + `createdAt`:

| Entity | Fields beyond `id`/`createdAt` |
|---|---|
| `CareerExperience` | `company`, `jobTitle`, `startDate`\*, `endDate`, `currentlyWorking`, `employmentType`, `location`, `description`, `achievements`, `skillsUsed[]` |
| `CareerAcademic` | `institution`, `degree`, `fieldOfStudy`, `startDate`\*, `endDate`, `currentlyStudying`, `location`, `description`, `gpa`, `achievements` |
| `CareerSkill` | `name`, `category` (one of Technical/Design/Leadership/Tools/General) |
| `CareerCredential` | `name`, `issuingOrganization`, `issueDate`, `expirationDate`, `credentialId`, `verificationUrl`, `mediaUrl` |
| `CareerLanguage` | `language`, `proficiency` (Native/Fluent/Professional/Intermediate/Basic) |
| `CareerAchievement` | `title`, `type`, `date`, `organization`, `description`, `url`, `mediaUrl` |

\* `startDate` is `YYYY-MM` per the type comments.

`mediaUrl` and `verificationUrl` are **plain URL strings with no upload flow** — unlike avatar and post images, there is no `upload-url` endpoint for career media. Whether these are third-party links, unvalidated free text, or orphaned storage keys is undecided.

### 3.7 Career visibility

Six booleans, one per section: `experience`, `academics`, `skills`, `credentials`, `languages`, `achievements`. `PublicCareerData` bundles the settings with the six record collections, so visibility is enforced server-side on the public read, not client-side.

### 3.8 Moderation entities

Four request/decision aggregates, admin-facing only:

- **Verification request** — `id`, `userId`, `message`, `notes`, `status` (`pending|approved|rejected`), `submittedAt`, `decisionNote`. Frontend submit payload adds optional `category`, `identificationNumber`, `websiteUrl`, `portfolioUrl`, `documentUrl` — these evidence fields are **not present in the admin read model**.
- **Content report** — `id`, `reporterId`, `targetType` (`post|user`), `targetId`, `reason` (`copyright|impersonation|inappropriate|spam|other`), `details`, `status` (`pending|resolved|dismissed`), `actionTaken`.
- **Featured request** — `id`, `userId`, `headline`, `message`, `isCuratedPinned`, `status` (`none|pending|featured|rejected`), `submittedAt`.
- **Audit log** — `id`, `adminId`, `action` (9 fixed values), `targetId`, `targetLabel`, `reason`, `timestamp`, `metadata`. **Append-only from the frontend's perspective; there is no create or delete operation.**

### 3.9 Broadcast announcement

`id`, `title`, `message`, `scope` (`all_users|creators_only|direct_user`), `targetUserId`, `severity` (`info|update|contest|warning`), `publishedAt`, `adminUsername`.

`direct_user` scope plus `targetUserId` means announcements are **addressable to one user**, which requires per-recipient read state that does not exist anywhere in the frontend. See section 10.

### 3.10 Entities that do not exist

No `Notification` entity. No `PostLike` entity despite `toggleLikePost` returning `{isLiked, likeCount}`. No `ProfileVisit` entity — the frontend has no view counter. No `Token`/`Session` entity — refresh tokens are opaque. No `Role`/`Permission` entity — roles are bare strings.

---

## 4. User Actions / Use Cases

### 4.1 Visitor (unauthenticated)

| ID | Action | Notes |
|---|---|---|
| V1 | Browse public profile by username | `GET /api/profiles/{username}` |
| V2 | Browse published work on a profile | `GET /api/profiles/{username}/posts` |
| V3 | View a single work | `GET /api/posts/{id}` |
| V4 | Browse explore feed, paginated | `GET /api/posts/explore` |
| V5 | Search work | Query param on explore |
| V6 | Read public career data | `GET /api/career/public/{username}` |
| V7 | Read terms / privacy | Static |
| V8 | Register | `POST /api/auth/register` |
| V9 | Login (email or username) | `POST /api/auth/login` |
| V10 | Check username availability | `GET /api/auth/check-username` |

**Visibility rule:** a visitor may only ever see `Published` posts and sections whose visibility flag is `true`. `Draft` and `Unpublished` posts must never be reachable by direct ID, including via `GET /api/posts/{id}`.

### 4.2 Creator (authenticated, owns the profile)

| ID | Action | Notes |
|---|---|---|
| C1 | Edit own profile fields | `PUT /api/profiles/me` |
| C2 | Upload / replace / remove avatar | 3-step; see section 8 |
| C3 | Manage social links | Add, update, delete, reorder |
| C4 | Update phone / account number | `PUT /api/profiles/me/phone` |
| C5 | Create work (as Draft) | `POST /api/posts` |
| C6 | Edit work | `PUT /api/posts/{id}` |
| C7 | Publish work | `POST /api/posts/{id}/publish` |
| C8 | Unpublish work | `POST /api/posts/{id}/unpublish` |
| C9 | Delete work | `DELETE /api/posts/{id}` |
| C10 | Add / remove / reorder work images | 4-step; see section 8 |
| C11 | Like / unlike any published work | `POST /api/posts/{id}/like` — **no backend** |
| C12 | Manage all six career sections | 24 operations |
| C13 | Configure career section visibility | 3 operations |
| C14 | Submit verification request | `POST /api/profiles/me/verify` |
| C15 | Submit featured request | `POST /api/profiles/me/featured` |
| C16 | Change password / email / username | 3 operations |
| C17 | Delete own account | `DELETE` — **no contract, no endpoint** |

### 4.3 Administrator

All 19 operations in section 2.5, plus the ability to hide a post (`audit` action `post_hidden` exists) which has **no frontend call site**. Administrators act on other users' resources throughout.

### 4.4 Cross-cutting use cases

| ID | Use case | Trigger |
|---|---|---|
| X1 | Register → auto-create profile | Registration must yield a usable profile without a separate creation step |
| X2 | Upload → commit | An uploaded object with no registered key is garbage; see section 8 |
| X3 | Publish → become discoverable | Transitions to `Published`, sets `publishedAt` |
| X4 | Unpublish → retain, hide | Retains content and `publishedAt` |
| X5 | Ban → deny access | `isBanned`; auth must reject the user |
| X6 | Verification approve → mark verified | Sets `isVerified` + `verificationStatus` + audit entry |
| X7 | Featured approve → mark featured | Sets `featuredStatus` + audit entry |
| X8 | Broadcast create → notify | See section 10 — delivery path is undefined |
| X9 | Session restore on load | `GET /api/auth/me`; failure is silently treated as logged-out |

---

## 5. Lifecycle & State Models

### 5.1 Post status

Three states, numeric on the wire, string in display:

```ts
PostStatus = { Draft: 0, Published: 1, Unpublished: 2 }
```

| From | To | Via | Effect |
|---|---|---|---|
| — | `Draft` | `POST /api/posts` | New work starts as Draft |
| `Draft` | `Published` | publish | Sets `publishedAt` if unset |
| `Published` | `Unpublished` | unpublish | Retains `publishedAt`, hides from listings |
| `Unpublished` | `Published` | publish | Re-visible |
| `Draft`/`Unpublished` | `Published` | update | **Not a transition; must not publish implicitly** |
| any | deleted | `DELETE` | Hard delete, images removed |

**There is no `Archived` state.** The studio dashboard's status filter offers only the three above plus `"all"`. A fourth state would require a frontend change.

**Serialization note:** `getMyPosts` sends `status` as `status.toString()`, producing the **string** `"0"`, `"1"`, `"2"` — not the number. The backend must accept the string form. Confirm before implementation; see section 19.

### 5.2 Verification status

`none → pending → verified | rejected`. Only one request is meaningful at a time; resubmission after `rejected` returns to `pending`. `isVerified` is the boolean projection of `verified`.

### 5.3 Featured status

`none → pending → featured | rejected`, plus an independent `isCuratedPinned` boolean. **These are orthogonal:** a user can be featured by approval and separately pinned by a curator. Frontend type is `"none" | "pending" | "featured" | "rejected"`.

### 5.4 User status and ban

Two overlapping representations:

- `isBanned: boolean` + `banReason` — on user-facing types
- `UserStatus: "active" | "suspended" | "pending_review"` — on admin types

Ban and unban are the only transitions the frontend can perform. `suspended` and `pending_review` are settable by no operation. Whether these are one field with two names or two separate fields is undecided (section 19).

### 5.5 Career records

**No lifecycle.** Career records have create, read, update, delete and no status. Deletion is immediate and unrecoverable. `createdAt` is the only timestamp besides the section's own dates.

### 5.6 Post image

No lifecycle. Ordering is mutable via bulk reorder; `displayOrder` is client-supplied. The frontend sends either `items: [{id, displayOrder}]` or `orderedIds: string[]` — the two shapes are alternates in the type and only one is used at runtime. Which is authoritative is undecided.

### 5.7 Moderation request lifecycles

| Entity | States | Terminal |
|---|---|---|
| Verification request | `pending → approved \| rejected` | Yes |
| Content report | `pending → resolved \| dismissed` | Yes |
| Broadcast | published at creation | No draft state |

---

## 6. Authorization Matrix

**Roles:** the frontend type is `UserRole = "Admin" | "Creator" | "Curator"`. `roles: string[]` on user types allows multiple.

**Important separation:** the *persona* system (`visitor | creator | admin`, persisted at `showcase_active_persona`) is a **frontend demonstration mechanism only** — `getActivePersona`, `switchPersona` and `resetDatabase` on `apiAuthClient` call mock services unconditionally, with no real API path. It is **not** an authorization model and the backend must not implement it.

| Operation | Visitor | Creator (owner) | Creator (non-owner) | Curator | Admin |
|---|---|---|---|---|---|
| `GET /api/posts/explore` | Yes | Yes | Yes | Yes | Yes |
| `GET /api/posts/{id}` (published) | Yes | Yes | Yes | Yes | Yes |
| `GET /api/posts/{id}` (draft/unpublished) | No | Own only | No | Undecided | Undecided |
| `GET /api/profiles/{username}` | Yes | Yes | Yes | Yes | Yes |
| `GET /api/profiles/{username}/posts` | Yes (published only) | Yes | Yes | Yes | Yes |
| `GET /api/career/public/{username}` | Yes (visible sections) | Yes | Yes | Yes | Yes |
| `POST /api/posts` | No | Yes | n/a | No | Undecided |
| `PUT/DELETE /api/posts/{id}` | No | Own only | No | No | Undecided |
| `POST /api/posts/{id}/publish`, `/unpublish` | No | Own only | No | No | Undecided |
| `POST /api/posts/{id}/like` | No | Yes | Yes | Yes | Yes |
| `GET /api/profiles/me` | No | Yes | n/a | No | Undecided |
| `PUT /api/profiles/me`, `/avatar`, `/phone`, `/social-links/*` | No | Yes | n/a | No | Undecided |
| `POST /api/profiles/me/verify`, `/featured` | No | Yes | n/a | No | Undecided |
| `GET/POST/PUT/DELETE /api/career/*` (own) | No | Yes | n/a | No | Undecided |
| `GET/PUT /api/career/visibility*` | No | Yes | n/a | No | Undecided |
| `GET /api/auth/me` | No | Yes | Yes | Yes | Yes |
| `POST /api/auth/change-password` | No | Yes | Yes | Yes | Yes |
| `PUT /api/auth/change-email`, `/change-username` | No | Yes | Yes | Yes | Yes |
| All `/api/admin/*` | No | No | No | **Partial** | Yes |
| Audit log writes | No | No | No | No | Backend-only (no endpoint) |

**Ownership must be enforced by relationship, not by ID.** `Post.profileId` and `SocialLink.profileId` mean a creator may not act on a resource merely by holding its GUID.

**Every "Undecided" cell is a real product question**, not an oversight. The frontend gives no signal on whether curators may moderate content or whether admins are subject to owner-only rules. See sections 11 and 19.

**`GET /api/profiles` is a live authorization and privacy defect** — see section 7.

---

## 7. Public vs Private Data

### 7.1 Field-level visibility

| Field | Owner view | Public view | Note |
|---|---|---|---|
| `id`, `userId` | Yes | `id` only | `userId` absent from public response |
| `username` | Yes | Yes | Primary public identifier |
| `email` | Yes | **No** | Deliberately absent from `PublicProfileResponse` |
| `firstName`, `lastName` | Yes | Yes | |
| `specialty` | Yes | Yes | Professional headline |
| `bio` | Yes | Yes | |
| `avatarUrl` | Yes | Yes | |
| `avatarKey` | Yes | **No** | Storage-internal; absent from public |
| `phoneNumber` | Yes | **Ambiguous** | Present in `PublicProfileResponse` — see 7.2 |
| `accountNumber` | Yes | **Ambiguous** | Present in `PublicProfileResponse` — see 7.2 |
| `isVerified`, `verificationStatus` | Yes | Yes | Badge state |
| `featuredStatus` | Yes | Yes | |
| `createdAt`, `updatedAt` | Yes | **No** | Absent from public |
| `socialLinks` | Yes | Yes | Via `SocialLinkDto` |
| `roles` | Yes (self) | **No** | `CurrentUserResponse` only |
| `isBanned`, `banReason` | Yes (self) | **No** | `CurrentUserResponse` only |
| `post.draft` content | Yes | **No** | Hard visibility boundary |
| Career records | Yes | Per-section flag | Enforced server-side |
| `likeCount` | Yes | Yes | Aggregate, always public |
| `isLiked` | Viewer-relative | Viewer-relative | Not a stored column |

### 7.2 Unresolved privacy decisions

**`phoneNumber` and `accountNumber` appear in `PublicProfileResponse`.** This means the current frontend type contract would expose a phone number and what appears to be a financial account number to every anonymous visitor. Two independent problems:

1. Whether these are intentionally public is not evidenced anywhere. There is no comment, no UI toggle, and no dedicated visibility setting.
2. **`accountNumber` has no stated purpose anywhere in the product.** Nothing in the frontend reads, validates, or displays it beyond passing it through a form. Its semantics are unknown.

This is flagged as a **blocking privacy question** (section 19, Q1). The safe reading is that both are private; the type says otherwise. Do not resolve by assumption.

### 7.3 Confirmed privacy defect

`apiProfileClient.getProfiles()` calls `GET /api/profiles` with `requiresAuth: false` and expects `ProfileDetailsResponse[]` — the **owner's** response shape, which includes `email`, `avatarKey`, `createdAt`, `updatedAt`, `phoneNumber` and `accountNumber`.

An anonymous request to this endpoint would return those fields for **every** profile. This is a mass-disclosure defect in the contract as written and must be resolved before the endpoint is implemented (section 19, Q2).

### 7.4 Viewer-relative data

`isLiked` is computed per requester. It is absent from the stored model and must be resolved at read time, returning `false` (not `null`) for anonymous callers so the response shape is stable.

---

## 8. File & Storage Requirements

### 8.1 The upload protocol

Three operations, consistently applied to avatar and post images:

```
1. POST .../upload-url   { contentType, fileSizeBytes }  →  { uploadUrl, storageKey }
2. PUT  <uploadUrl>      <raw file bytes>                 →  storage (no auth header)
3. POST/PUT ...          { storageKey }                    →  registers the reference
```

Step 2 is a **direct browser-to-storage upload**. The frontend sends only `Content-Type`; it sends no credentials, because `apiClient.posts.ts:146-152` uses bare `fetch`, not `httpFetch`.

`storageKey` is returned before the file is uploaded, so the backend must generate and reserve it server-side. `UploadUrlRequest` carries `contentType` and `fileSizeBytes`, so the backend has both facts available for validation and quota enforcement **at step 1** — before any bytes are accepted.

### 8.2 Required behaviors

| Requirement | Detail |
|---|---|
| Validate before issuing a URL | `contentType` allowlist and `fileSizeBytes` ceiling checked at step 1 |
| Bound the pre-signed URL | Short expiry; single-purpose; scoped to the returned key |
| Enforce ownership on step 3 | Only the key's issuer may register it |
| Idempotency | Re-registering an existing key must not duplicate the record |
| Orphan collection | A key uploaded but never registered is garbage; it needs an expiry policy |
| Deletion is coupled | Removing an image or avatar must delete the stored object, not just the row |
| Post deletion cascades | Deleting a post must remove all its images from storage |
| URL resolution | `url` is derived from `storageKey`; the two must not drift |

### 8.3 Undecided

- **`storageKey` vs `url` relationship.** Both are stored and returned. Either `url` is a redundant denormalization that can go stale, or the two encode different lifetimes (e.g. signed vs permanent). Not derivable from the frontend.
- **Career media has no upload path.** `Credential.mediaUrl` and `Achievement.mediaUrl` are bare strings with no `upload-url` endpoint, while `StorageTelemetry` counts `documentsBytes` as a category. Whether career media is a third-party link, direct-to-storage untracked upload, or unused field is undecided.
- **Quota and telemetry.** `StorageTelemetryDto` requires `totalCapacityBytes`, `usedBytes`, `totalFilesCount`, `monthlyBandwidthBytes`, `requestsCount`, and a `breakdown` into images/documents/thumbnails, plus per-user `topConsumers` with `bytesUsed` and `filesCount`. This implies accounting for **bandwidth and request counts**, not just stored bytes — a meaningfully larger requirement than a size total. `AdminUserListItem.storageUsedBytes` implies per-user tracking.
- **Thumbnails.** `PostSummaryResponse.thumbnailUrl` implies derived image variants. No endpoint produces one.
- **No storage provider is a requirement.** Cloudflare R2 appears in the existing implementation, but the frontend depends only on "a pre-signed URL and a stable key". Any object store satisfying sections 8.1–8.2 is conformant.

---

## 9. Search / Filtering / Sorting / Pagination

### 9.1 Pagination envelope

One envelope, used by every paginated endpoint:

```ts
PaginatedList<T> = {
  items: T[]; pageNumber: number; pageSize: number;
  totalCount: number; totalPages: number;
  hasPreviousPage: boolean; hasNextPage: boolean;
}
```

`pageNumber` is **1-based** (all call sites default to `1`). Six fields are returned; four are redundant (`totalPages`, `hasPreviousPage`, `hasNextPage` are derivable from `totalCount` and `pageSize`) but all six must be present.

### 9.2 Paged endpoints and defaults

| Endpoint | Defaults | Filters |
|---|---|---|
| `GET /api/posts/explore` | `pageNumber=1`, `pageSize=12` | `search`, `category` |
| `GET /api/profiles/{username}/posts` | `pageNumber=1`, `pageSize=12` | — |
| `GET /api/posts/mine` | `pageNumber=1`, `pageSize=10` | `status` |

`category` is sent only when it is not the literal `"All"` — the sentinel is filtered client-side and must not reach the backend as a filter value.

### 9.3 Client-side vs server-side

| Behavior | Where it lives | Requirement |
|---|---|---|
| Explore paging | Server | Backend paginates |
| Search text | Server (`search` param) | Backend filters |
| Category filter | Server (`category` param) | Backend filters — **but see 9.5** |
| `status` filter on own posts | Server | Backend filters |
| Studio search box | Client | Over the already-fetched page |
| Studio status tabs | Client | Over the already-fetched page |
| Studio sort control | Client | Over the already-fetched page |

**Required consequence:** the studio dashboard paginates at 10 but then searches, filters and sorts **within the current page only**. This is correct existing behavior and the backend must not be asked to absorb it. It is a known UX limitation, not a requirement.

### 9.4 Sort

**No endpoint accepts a sort parameter.** All ordering is applied client-side. The backend must return a **stable, deterministic** order (e.g. `publishedAt DESC, id ASC`) or client-side sorting will produce unstable results across pages. No default sort is specified in the contract.

### 9.5 Undecided

- **What is `category`?** It is sent to `GET /api/posts/explore` but posts have no category field. It may be derived from tags, or the parameter is dead. Unresolvable from the frontend.
- **No sort contract at all.** A stable tiebreaker is the only hard requirement.
- **Search scope.** Whether `search` covers title, description, tags, or creator name is unspecified.
- **No admin pagination.** `GET /api/admin/users`, `/verifications`, `/reports`, `/featured`, `/audit-logs` all return **bare arrays**, not `PaginatedList`. This is inconsistent with the rest of the API and will not scale. Flagged (section 19, Q6).

---

## 10. Notifications & Events

### 10.1 What exists

`/notifications` renders broadcasts, filtered by `all | announcements | warnings`. The `warnings` filter implies a severity concept, and `BroadcastAnnouncementItem.severity` (`info | update | contest | warning`) supplies it.

### 10.2 What does not exist

**There is no notifications domain.** No entity, no API client, no endpoint, no persistence.

| Missing | Evidence |
|---|---|
| Notification entity | No `Notification` type anywhere |
| Notifications API client | No `apiClient.notifications.ts` |
| Read/unread persistence | `useState<Set<string>>` in `NotificationsPage.tsx:16` — component state only, lost on reload |
| Mark-as-read endpoint | None called |
| Per-recipient state | `scope: "direct_user"` + `targetUserId` requires it |
| Delivery | No push, email, or in-app transport |
| Events | No domain events, outbox, or message bus anywhere |

### 10.3 Architectural defect

As established in section 2.6, the user-facing notifications page reads `GET /api/admin/broadcasts` — an admin-namespaced endpoint. Either:

- the endpoint is actually public-readable and the `/admin` namespace is misleading, or
- the page will receive `401`/`403` the moment mocks are disabled.

Broadcast announcements are **user-facing content**, not admin data. The correct shape is a user-scoped read endpoint that returns only broadcasts addressed to the caller. Recorded as section 19, Q3.

### 10.4 Events implied by the domain

These are consequences of other requirements, not independent features. Each is a design obligation, not a confirmed requirement:

| Event | Implied by |
|---|---|
| `PostPublished` | C7 — may notify followers-of-content, notify admins of new content |
| `PostUnpublished` | C8 |
| `VerificationDecided` | X6 — must notify the applicant |
| `FeaturedDecided` | X7 — must notify the applicant |
| `UserBanned` | X5 — must notify the banned user |
| `BroadcastPublished` | X8 — must reach the target audience |
| `AccountDeleted` | C17 |

Whether these become persisted domain events, queued messages, or synchronous side effects is undecided. **No event infrastructure should be assumed** — synchronous handling satisfies the frontend as written.

### 10.5 Audit log

`AuditLogItem.action` is a **closed 9-value set**, and every admin action in section 2.5 maps to one. The frontend **only reads** audit logs. Writing is a backend-only responsibility, and it is the one place where a durable event trail is unambiguously required by the contract — a moderation action with no record is unrecoverable.

`post_hidden` is in the action set but has **no frontend call site** (section 4.3).

---

## 11. Admin Requirements

**Confirmed gap: none of the 19 admin operations is implemented in the backend.** The 8 screens are fully built in the frontend and entirely absent server-side.

### 11.1 Dashboard

`GET /api/admin/dashboard` returns seven counters plus two embedded collections:

`totalUsersCount`, `activeCreatorsCount`, `pendingVerificationsCount`, `pendingReportsCount`, `curatedPinnedCount`, `storageUsedBytes`, `storageCapacityBytes`, `recentAuditLogs[]`, `recentBroadcasts[]`.

Note `activeCreatorsCount` and `curatedPinnedCount` are **derived from other aggregates**, and the audit/broadcast lists are **duplicated** from the dedicated endpoints. The dashboard is a denormalized read model; the counters must not become stored columns.

**Definition gap:** what makes a creator "active" over what window? Unspecified.

### 11.2 User management

- List with `search`, `status`, `role` filters. Returns bare arrays.
- `postsCount` and `storageUsedBytes` per user are **aggregates**, not columns.
- **Ban** with a required `reason`; **unban**; **set roles** to an arbitrary subset of `Admin | Creator | Curator`.

**Required safeguards (not derivable from the frontend, but mandatory for a role-management endpoint):**
- An admin must not remove their own admin role, or the platform can be locked out.
- The last remaining admin must not be demoted or banned.
- Role changes take effect on the target's **next** token issuance; existing access tokens carry stale claims. A short access-token lifetime is the mitigation.

### 11.3 Verification moderation

List pending requests; approve or reject with an optional `note`. Approval must set `isVerified = true` and `verificationStatus = "verified"` on the profile, and write an audit entry. Rejection sets `"rejected"`.

**Data gap:** the admin read model (`VerificationRequestItem`) has no `identificationNumber`, `websiteUrl`, `portfolioUrl`, `documentUrl`, `category`, or `documentUrl` — yet the submit payload (`VerificationRequestDto`) does. An admin reviewing a request **cannot see the evidence the applicant submitted.** Either the fields are collected and discarded, or the read model is incomplete (section 19, Q4).

`documentUrl` on a verification request implies **document upload**, for which no upload endpoint exists in the career or profile surfaces.

### 11.4 Content reports

`GET /api/admin/reports?status` lists; resolve (with `actionTaken`) or dismiss.

**Confirmed gap: there is no way to create a report.** No frontend screen, no client method, no endpoint. The moderation queue can never be populated by user action — a severe structural gap in a moderation feature. Either reporting is unimplemented in the UI, or it is the intended scope cut (section 19, Q5).

`targetType` is `post | user`, so reports are polymorphic. Resolving a report does not need to modify the target; the action is a free-text record plus a status change.

### 11.5 Featured curation

Four operations: list, `PUT /api/admin/featured/{id}/pin { isPinned }`, approve, reject.

`isCuratedPinned` (boolean) and `status` (4-value) are **independent** — see section 5.3. Pinning is what the explore feed would surface; approval is a profile badge.

`headline` on `FeaturedRecommendationItem` has **no corresponding submit field** — `FeaturedRequestDto` is only `{ message, notes? }`.

### 11.6 Storage telemetry

`GET /api/admin/storage` → `StorageTelemetryDto`. Full field list in section 8.3. Requires aggregate accounting across users, file types, and **time** (monthly bandwidth, request counts).

### 11.7 Audit logs

`GET /api/admin/audit-logs` — read-only, bare array, no filters, no pagination. Every moderation action in 11.2–11.5 must write an entry. See section 10.5.

### 11.8 Broadcasts

`GET` list, `POST` create with `{ title, message, scope, targetUserId?, severity }`. `targetUserId` is required when `scope = "direct_user"` — a conditional the type system does not enforce. The response omits `id`, `publishedAt`, and `adminUsername` because the backend assigns them.

### 11.9 Curators

`Curator` is a declared role with **no defined permission set**. A curator can pin featured content per the matrix in section 6, but cannot moderate users, verifications, or reports. This must be stated explicitly rather than inferred.

---

## 12. Frontend Gaps & Product Clarifications

### 12.1 Confirmed frontend gaps (UI exists, no contract)

| Gap | Evidence |
|---|---|
| OAuth | `/auth/complete-oauth` page; no provider, no callback endpoint |
| Delete account | `/settings/security/delete-account` page; no endpoint |
| Two-factor auth | `/settings/security/two-factor` → redirect; no feature |
| Session management | `/settings/security/sessions` → redirect; no feature |
| Like toggle | `POST /api/posts/{id}/like`; **no backend endpoint** |
| Create report | `ContentReportItem` is admin-read; no submit path |
| Hide post | `post_hidden` audit action; no call site |
| Notifications | Page renders; no domain, no API, no read persistence |
| `GET /api/profiles` | Returns owner-shaped data anonymously |

### 12.2 Contract defects found during analysis

| # | Defect | Evidence |
|---|---|---|
| D1 | `publish` / `unpublish` verb mismatch | Frontend `apiClient.posts.ts:122,129` sends **POST**; backend `PublishPost.cs:16`, `UnpublishPost.cs:16` map **PUT** |
| D2 | Like endpoint missing | `apiClient.posts.ts:195` calls `POST /api/posts/{id}/like`; no backend file |
| D3 | Anonymous mass disclosure | `apiProfileClient.getProfiles()` → `GET /api/profiles`, `requiresAuth: false`, expects `ProfileDetailsResponse[]` including `email` |
| D4 | User page reads admin endpoint | `NotificationsPage` → `GET /api/admin/broadcasts` |
| D5 | `PostStatus` sent as string | `apiClient.posts.ts:86` sends `status.toString()` → `"0"`, not `0` |
| D6 | Two reorder shapes | `ReorderPostImagesRequest` has both `items` and `orderedImageIds`; `ReorderSocialLinksRequest` has both `items` and `orderedIds` |
| D7 | `apiClient.getCurrentUser` swallows all errors | `apiClient.auth.ts:58-62` catches everything → `null`; a 500 is indistinguishable from logged-out |
| D8 | Mock service appears twice in `apiPostsClient` | `apiClient.posts.ts:16` imports `mockService`; `mockService.posts.ts` / `.command.ts` / `.query.ts` also exist |

### 12.3 Validation rules

The frontend enforces almost no validation, so the backend must decide limits. **Confirmed from source:**

| Field | Rule | Evidence |
|---|---|---|
| `Post.description` | max 2000 | `WizardStepEditorial.tsx:46` `maxLength={2000}` |
| `Post.tags` | max 10 | `WizardStepEditorial.tsx:55,74,97` |
| `Post.title` | **no max length** | No `maxLength` in editor — backend must set one |
| `Post.title` | **no min length** | Required-ness unverified in the editor |
| `Post.tags` | deduped | `disabled={isSelected \|\| tags.length >= 10}` — selected tags unselectable |
| Career dates | `YYYY-MM` | Type comments in `career.ts` |
| Career fields | trim-nonempty only | No `maxLength`, no `pattern` in any career form |

**All other limits are undetermined**: username format and length, email normalization, password policy, `specialty`/`bio` length, social-link `platform` allowlist, `externalUrl` validation, tag length, `employmentType`/`type`/`category` allowlists, `gpa` format, image count per post, avatar dimensions.

Note the asymmetry: `Post.description` is capped client-side but `Post.title` is not. Title is the more prominent field.

### 12.4 Error contract

`httpFetch` throws the **parsed response body as-is** for any non-2xx, and synthesizes `{ title: statusText, status }` only when the body is not JSON. The `ProblemDetails` interface includes `errors: Record<string, string[]>` for field-level validation.

Requirements: all errors must be JSON `ProblemDetails`; a non-JSON error body degrades to a title/status pair; `204` returns `{}` cast to `T`, so **`void` endpoints may return 204 or an empty JSON object** — both are safe.

No frontend branch handles `401` by triggering refresh; `getCurrentUser` swallows errors. Expired-token behavior is effectively untested by the UI.

---

## 13. Backend Requirement Map

Every backend requirement, with status. `EXISTING` = satisfied by the current implementation. `GAP` = not implemented. `DEFECT` = implemented but contradicts the frontend.

### 13.1 Auth — 8 requirements

| # | Requirement | Status |
|---|---|---|
| A1 | Register; auto-create profile (X1) | EXISTING |
| A2 | Login by email **or** username | EXISTING |
| A3 | Logout | EXISTING |
| A4 | Current user; viewer-relative fields | EXISTING |
| A5 | Username availability check | **GAP** — no `CheckUsername` endpoint file |
| A6 | Change password (requires current) | EXISTING |
| A7 | Change email (requires current) | EXISTING |
| A8 | Change username (requires current) | EXISTING |

Rate limiting is already applied to register, login, refresh, and all three change-username/email/password operations (`"auth-policy"`). Refresh is `EXISTING` but has no frontend call site.

### 13.2 Profiles — 13 requirements

| # | Requirement | Status |
|---|---|---|
| P1 | Get own profile | EXISTING |
| P2 | Get public profile; correct field projection | EXISTING |
| P3 | Get public profile works | EXISTING |
| P4 | Update profile | EXISTING |
| P5 | Avatar upload URL | EXISTING |
| P6 | Register avatar key | EXISTING |
| P7 | Remove avatar + delete object | EXISTING |
| P8 | Phone / account number update | **GAP** — no `Phone` endpoint |
| P9 | Submit verification request | **GAP** |
| P10 | Submit featured request | **GAP** |
| P11 | `GET /api/profiles` (all profiles) | **DEFECT** — must not return owner fields anonymously (D3) |

### 13.3 Social links — 5 requirements

All **EXISTING**: add, update, delete, reorder, and ownership enforcement on `{id}` routes.

### 13.4 Posts — 14 requirements

| # | Requirement | Status |
|---|---|---|
| Po1 | Create (defaults to Draft) | EXISTING |
| Po2 | Read by id; **hide draft/unpublished from non-owners** | EXISTING |
| Po3 | Update | EXISTING |
| Po4 | Delete + cascade image objects | EXISTING |
| Po5 | Publish / set `publishedAt` | **DEFECT** — verb mismatch (D1) |
| Po6 | Unpublish | **DEFECT** — verb mismatch (D1) |
| Po7 | Explore feed, paginated | EXISTING |
| Po8 | Own posts, filtered by status | EXISTING |
| Po9 | Image upload URL (rate-limited `"upload-policy"`) | EXISTING |
| Po10 | Register image | EXISTING |
| Po11 | Remove image + delete object | EXISTING |
| Po12 | Reorder images | EXISTING |
| Po13 | Like toggle → `{isLiked, likeCount}` | **GAP** — no endpoint (D2) |
| Po14 | `thumbnailUrl` / `imageCount` derivation | **GAP** — no thumbnail producer |

### 13.5 Career — 28 requirements, all **GAP**

Summary (1), five CRUD sets (24), visibility (3), public read (2 → 25 total distinct operations, 28 including the alias-free count). Nothing exists. Section 11 of the type inventory and 3.6 define the shape.

### 13.6 Admin — 19 requirements, all **GAP**

Dashboard (1), users (4), verifications (3), reports (3), featured (4), storage (1), audit logs (1), broadcasts (2). Section 11 defines the shape.

### 13.7 Notifications — all **GAP**

No entity, no endpoint, no read-state persistence. Plus defect D4 (user page reads admin endpoint).

### 13.8 Cross-cutting

| # | Requirement | Status |
|---|---|---|
| X-R1 | `ProblemDetails` on all errors | EXISTING |
| X-R2 | `PaginatedList<T>` envelope | EXISTING |
| X-R3 | Bearer auth + refresh | EXISTING |
| X-R4 | Rate limiting on auth + upload | EXISTING |
| X-R5 | Ownership enforcement on all `{id}` routes | EXISTING |
| X-R6 | Audit entries for every moderation action | **GAP** (tied to admin) |
| X-R7 | Stable deterministic ordering | **GAP** — unspecified |
| X-R8 | Title length limit | **GAP** — unspecified |
| X-R9 | Orphan object expiry | **GAP** |

**Summary: 39 EXISTING, 6 DEFECT, ~79 GAP.**

---

## 14. Proposed Domain Model

Descriptive only. Not a schema, not an implementation instruction. Column types are omitted because the persistence decisions in section 19 are unresolved.

### 14.1 Aggregates and relationships

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
                        ├──1:N──> FeaturedRequest
                        └──1:N──> PostLike  (inferred, not in contract)
```

### 14.2 Ownership boundary

`UserAccount` owns credentials and role. `Profile` owns everything public. A Post belongs to a **Profile**, not a User — so `Post` has no `userId` and ownership always resolves through `Profile.userId`. This is confirmed by `PostCreatorDto` exposing `profileId` and `Post.profileId`.

### 14.3 Model notes

- `Profile.username` and `UserAccount.username` both exist. Two sources of truth for the public identifier.
- `PostLike` is **inferred** from `toggleLikePost` returning `{isLiked, likeCount}`. A like requires a (post, user) pair; `likeCount` is a maintained aggregate. The frontend does not model this entity, so its exact shape is unconfirmed.
- Career entities are six parallel types with no shared base beyond `id`/`createdAt` and no common abstraction in the contracts. Uniform handling is desirable but is not evidenced.
- `CareerVisibility` may be six columns on `Profile` or a separate entity. The `toggleSectionVisibility` operation returns the full settings object, which slightly favors separate storage.
- `AuditLog` is append-only and referenced by `adminId` + `targetId` (polymorphic).
- `ContentReport` is polymorphic over `targetType ∈ {post, user}`.
- `BroadcastAnnouncement` requires per-recipient read state for `direct_user` scope; no such entity exists.

### 14.4 Deliberately absent

No follower/following, no friendship, no comment, no direct message, no activity stream, no profile view counter, no tag entity, no category entity, no notification entity, no refresh-token entity.

---

## 15. Application Use Case Map

Grouped by use case, not by technical layer. Each states the invariant that must hold.

### 15.1 Account lifecycle

| Use case | Steps | Invariant |
|---|---|---|
| Register | validate → create user → create profile → issue tokens | One profile per user, always |
| Login | resolve email-or-username → verify → check ban → issue tokens | Banned users cannot obtain tokens |
| Restore session | read token → validate → load current user | Failure ⇒ unauthenticated, not error |
| Change email | verify password → check uniqueness → update → invalidate sessions | Old sessions must stop working |
| Change username | verify password → check availability → update | Public URL changes |
| Delete account | C17 | **Undefined** — see Q7 |

### 15.2 Profile and media

| Use case | Steps | Invariant |
|---|---|---|
| Update profile | validate → write allowed fields | Must not write `username`, `email`, `isVerified`, `featuredStatus` |
| Upload avatar | validate type/size → issue URL → direct PUT → register key | Only the issuer may register |
| Remove avatar | unlink → delete object | Storage reclaimed |
| Reorder social links | validate all ids belong to caller → apply order | No partial application |
| Submit verification | require `none`/`rejected` → create `pending` | Applicant sees status |

### 15.3 Post lifecycle

| Use case | Steps | Invariant |
|---|---|---|
| Create post | validate → insert `Draft` → return id | Never implicitly published |
| Update post | verify ownership → validate → write | Never implicitly published |
| Publish | verify ownership → transition → set `publishedAt` if null | Only the documented verb |
| Unpublish | verify ownership → transition | Content retained |
| Delete post | verify ownership → delete images → delete post | Storage reclaimed |
| Add image | verify ownership + key issuer → insert at order | No duplicate keys |
| Reorder images | verify all ids belong to post → apply | Atomic |
| Toggle like | toggle (post, user) → return new count | Count always consistent |
| Browse explore | filter published → paginate → resolve `isLiked` per viewer | Drafts never appear |

### 15.4 Career

Per section, four use cases each: **List** (own: all; public: visible sections only), **Create**, **Update**, **Delete**; plus **Get summary** (counts) and **Set visibility** (all or one section).

Key invariant: the public read must filter by visibility **server-side**, since `PublicCareerData` returns the settings object alongside the records.

### 15.5 Moderation

| Use case | Invariant |
|---|---|
| List users | Aggregates (`postsCount`, `storageUsedBytes`) correct; filters applied |
| Ban user | `isBanned` set, `reason` recorded, audit written, tokens rejected |
| Unban user | Ban cleared, audit written |
| Set roles | Cannot self-demote; cannot remove last admin; audit written |
| Approve verification | `isVerified` true, status `verified`, applicant notified, audit written |
| Reject verification | Status `rejected`, `decisionNote` stored, applicant notified, audit written |
| Resolve / dismiss report | Status updated, `actionTaken` recorded, audit written |
| Pin / unpin featured | `isCuratedPinned` toggled, audit written |
| Approve / reject featured | `featuredStatus` updated, audit written |
| Read audit logs | Read-only; no mutation path |
| Create broadcast | `targetUserId` required iff `direct_user`; delivered to audience |

### 15.6 Operations

| Use case | Invariant |
|---|---|
| Issue upload URL | Type/size validated **before** URL issued; rate limited |
| Read storage telemetry | All aggregates accurate; `direct_user` broadcasts accounted for |
| Read dashboard | Counters derived, never stale |

---

## 16. API Requirement Map

**Descriptive specification of what the frontend calls.** HTTP method shown as the frontend sends it. The 6 method mismatches in section 12.2 are unresolved.

### 16.1 Auth

| Method | Path | Request | Response | Auth |
|---|---|---|---|---|
| GET | `/api/auth/check-username?username=` | — | `{ available: boolean }` | No |
| POST | `/api/auth/register` | `RegisterRequest` | `AuthResponse` | No |
| POST | `/api/auth/login` | `LoginRequest` | `AuthResponse` | No |
| POST | `/api/auth/logout` | — | void | Yes |
| GET | `/api/auth/me` | — | `CurrentUserResponse` | Yes |
| POST | `/api/auth/change-password` | `ChangePasswordRequest` | void | Yes |
| PUT | `/api/auth/change-email` | `ChangeEmailRequest` | void | Yes |
| PUT | `/api/auth/change-username` | `ChangeUsernameRequest` | void | Yes |
| POST | `/api/auth/refresh` | — | `AuthResponse` | No |

`AuthResponse = { accessToken, refreshToken, expiry? }`. Login accepts `emailOrUsername`. Register takes `{ email, username, password, firstName, lastName, bio?, avatarUrl? }` — note `avatarUrl` at registration, which conflicts with the 3-step avatar flow and is unused by it.

### 16.2 Profiles

| Method | Path | Response | Auth |
|---|---|---|---|
| GET | `/api/profiles` | `ProfileDetailsResponse[]` ⚠ | No ⚠ |
| GET | `/api/profiles/me` | `ProfileDetailsResponse` | Yes |
| GET | `/api/profiles/{username}` | `PublicProfileResponse` | No |
| GET | `/api/profiles/{username}/posts` | `PaginatedList<PostSummaryResponse>` | No |
| PUT | `/api/profiles/me` | void | Yes |
| POST | `/api/profiles/me/avatar/upload-url` | `UploadUrlResponse` | Yes |
| PUT | `/api/profiles/me/avatar` | void (`{ storageKey }`) | Yes |
| DELETE | `/api/profiles/me/avatar` | void | Yes |
| POST | `/api/profiles/me/social-links` | `SocialLinkIdResponse` | Yes |
| PUT | `/api/profiles/me/social-links/{id}` | void | Yes |
| DELETE | `/api/profiles/me/social-links/{id}` | void | Yes |
| PUT | `/api/profiles/me/social-links/reorder` | void | Yes |
| PUT | `/api/profiles/me/phone` | void | Yes |
| POST | `/api/profiles/me/verify` | void | Yes |
| POST | `/api/profiles/me/featured` | void | Yes |

⚠ Must not return owner-only fields anonymously (D3, section 7.3).

### 16.3 Posts

| Method | Path | Response | Auth |
|---|---|---|---|
| GET | `/api/posts/explore` | `PaginatedList<ExplorePostResponse>` | No |
| GET | `/api/posts/{id}` | `PostDetailsResponse` | No |
| GET | `/api/posts/mine` | `PaginatedList<PostSummaryResponse>` | Yes |
| POST | `/api/posts` | `PostCreatedResponse` | Yes |
| PUT | `/api/posts/{id}` | void | Yes |
| DELETE | `/api/posts/{id}` | void | Yes |
| POST | `/api/posts/{id}/publish` ⚠ | void | Yes |
| POST | `/api/posts/{id}/unpublish` ⚠ | void | Yes |
| POST | `/api/posts/{id}/like` | `{ isLiked, likeCount }` | Yes |
| POST | `/api/posts/{id}/images/upload-url` | `UploadUrlResponse` | Yes |
| POST | `/api/posts/{id}/images` | `PostImageAddedResponse` | Yes |
| DELETE | `/api/posts/{id}/images/{imageId}` | void | Yes |
| PUT | `/api/posts/{id}/images/reorder` | void | Yes |
| PUT | `<uploadUrl>` (storage) | — | No (signed URL) |

⚠ Backend currently maps `PUT`.

### 16.4 Career — all unimplemented

| Method | Path | Response | Auth |
|---|---|---|---|
| GET | `/api/career/summary` | `CareerSummary` | Yes |
| GET | `/api/career/experiences` | `CareerExperience[]` | Yes |
| POST | `/api/career/experiences` | `CareerExperience` | Yes |
| PUT | `/api/career/experiences/{id}` | `CareerExperience` | Yes |
| DELETE | `/api/career/experiences/{id}` | void | Yes |
| *Same five for `/academics`, `/skills`, `/credentials`, `/languages`, `/achievements`* | | | |
| GET | `/api/career/visibility` | `CareerVisibilitySettings` | Yes |
| PUT | `/api/career/visibility` | `CareerVisibilitySettings` | Yes |
| PUT | `/api/career/visibility/{section}` | `CareerVisibilitySettings` | Yes |
| GET | `/api/career/public` | `PublicCareerData` | No |
| GET | `/api/career/public/{username}` | `PublicCareerData` | No |

**Inconsistency:** career create/update **return the created/updated entity**, whereas post create returns only `{ id }` and post update returns `void`. Both patterns are valid; the difference must be honored.

### 16.5 Admin — all unimplemented

| Method | Path | Response | Auth |
|---|---|---|---|
| GET | `/api/admin/dashboard` | `AdminDashboardMetricsDto` | Admin |
| GET | `/api/admin/users?search&status&role` | `AdminUserListItem[]` | Admin |
| POST | `/api/admin/users/{id}/ban` | void (`{ reason }`) | Admin |
| POST | `/api/admin/users/{id}/unban` | void | Admin |
| PUT | `/api/admin/users/{id}/roles` | void (`{ roles }`) | Admin |
| GET | `/api/admin/verifications` | `VerificationRequestItem[]` | Admin |
| POST | `/api/admin/verifications/{id}/approve` | void (`{ note }`) | Admin |
| POST | `/api/admin/verifications/{id}/reject` | void (`{ note }`) | Admin |
| GET | `/api/admin/reports?status` | `ContentReportItem[]` | Admin |
| POST | `/api/admin/reports/{id}/resolve` | void (`{ actionTaken }`) | Admin |
| POST | `/api/admin/reports/{id}/dismiss` | void | Admin |
| GET | `/api/admin/featured` | `FeaturedRecommendationItem[]` | Admin |
| PUT | `/api/admin/featured/{id}/pin` | void (`{ isPinned }`) | Admin |
| POST | `/api/admin/featured/{id}/approve` | void | Admin |
| POST | `/api/admin/featured/{id}/reject` | void | Admin |
| GET | `/api/admin/storage` | `StorageTelemetryDto` | Admin |
| GET | `/api/admin/audit-logs` | `AuditLogItem[]` | Admin |
| GET | `/api/admin/broadcasts` | `BroadcastAnnouncementItem[]` | Admin ⚠ also used by user page |
| POST | `/api/admin/broadcasts` | void | Admin |

### 16.6 Notifications — no contract exists

Required but unspecified: list for the current user; mark read; mark all read; unread count. See section 19, Q3.

### 16.7 Conventions

- Base URL from `VITE_API_URL`; **empty string means same-origin** (`apiClient.base.ts:5`). The backend must be reachable at the same origin or be proxied.
- JSON in, JSON out. `Content-Type: application/json` unless the body is `FormData`.
- Bearer token on every request except where `requiresAuth: false`.
- `204` ⇒ `{}`; `void` endpoints may return `204` or empty JSON.
- Non-2xx ⇒ body is thrown as-is; must be JSON `ProblemDetails` with optional `errors: Record<string, string[]>`.

---

## 17. Database Requirement Map

**Descriptive only.** No DDL, no column types, no indexes, no migrations. Storage technology and schema shape depend on decisions in section 19.

### 17.1 Entities to persist

Derived from section 14: `UserAccount`, `Profile`, `SocialLink`, `Post`, `PostImage`, six career entities, career visibility, `PostLike` (inferred), `VerificationRequest`, `FeaturedRequest`, `ContentReport`, `AuditLog`, `BroadcastAnnouncement`, per-recipient broadcast read state (required by `direct_user`, not modelled).

### 17.2 Integrity constraints

| Constraint | Basis |
|---|---|
| Username unique | Public identifier; used for login |
| Email unique | Used for login |
| `Profile.userId` unique | One profile per user (X1) |
| `SocialLink.profileId` FK | Ownership |
| `Post.profileId` FK | Ownership resolves via profile, not user |
| `PostImage.postId` FK; `storageKey` unique | Prevents duplicate registration (8.2) |
| Career entities FK to profile | All six |
| At least one admin | 11.2 |

### 17.3 Computed vs stored

Must **not** be stored as columns — computed at read time or maintained transactionally:

`likeCount`, `isLiked`, `thumbnailUrl`, `imageCount`, `postsCount`, `storageUsedBytes`, all `AdminDashboardMetricsDto` counters, `CareerSummary` counts, `totalPages`, `hasPreviousPage`, `hasNextPage`.

Note `likeCount` is the classic case: a maintained counter must stay exactly consistent with the underlying likes, or it will drift permanently.

### 17.4 Indexing needs

Derived from actual access patterns, not guesses:

| Access pattern | Index needed on |
|---|---|
| `GET /api/profiles/{username}` | `Profile.username` (unique) |
| `GET /api/profiles/{username}/posts` | `Post.profileId` + status + `publishedAt` |
| `GET /api/posts/explore` (published, paged) | `Post.status` + stable sort key |
| `GET /api/posts/mine?status` | `Post.profileId` + `status` |
| Like toggling | `PostLike(postId, userId)` unique |
| Career lists per profile | `profileId` on all six career tables |
| Admin queues | `status` on verification/report/featured requests |
| `GET /api/auth/check-username` | `username` uniqueness lookup |
| `GET /api/auth/login` | `email` **and** `username` |

The last row is why login takes a single `emailOrUsername` field: one identifier resolving against two unique indexes.

### 17.5 Ordering and retention

- `publishedAt` and `createdAt` need deterministic tiebreakers (section 9.4).
- Deletion semantics differ by entity: posts and career records hard-delete; users may be soft-deleted (C17 undefined). **Resolve Q7 first.**
- Moderation decisions are historically significant and should not cascade-delete with their target.
- Audit logs are append-only, grow without bound, and likely need a retention policy.

---

## 18. Final Backend Scope

### 18.1 What the backend must do

1. **Account lifecycle** — register, login by email or username, logout, session restore, password/email/username change, username availability.
2. **Profile ownership** — one profile per user, public and private projections, self-service updates.
3. **Social links** — CRUD with user-controlled ordering.
4. **Works lifecycle** — create as Draft, edit, publish, unpublish, delete; Draft/Unpublished hidden from everyone but the owner.
5. **Work images** — validated pre-signed upload, registration, ordering, deletion with object cleanup.
6. **Likes** — toggle and accurate count.
7. **Career** — six independent record sets with per-section visibility enforced server-side.
8. **Discovery** — paginated published feed, search, deterministic ordering.
9. **Moderation requests** — verification and featured submission plus admin decision.
10. **Administration** — user management, moderation queues, storage telemetry, append-only audit trail, broadcast announcements.
11. **Notifications** — user-scoped announcement delivery with persistent read state.
12. **Platform-wide** — `ProblemDetails` errors, consistent pagination, ownership enforcement, rate limiting on auth and upload, stable ordering.

### 18.2 What the backend does not need to do

- **No social graph.** No followers, following, friends, or connections.
- **No messaging.** No direct messages, chat, or comments.
- **No activity feed.** The feed is a discovery surface, not a social timeline.
- **No post comments or replies.**
- **No follower counts, view counters, or share counts.** None appear in any contract.
- **No tag or category entities** unless Q5 resolves the orphaned `category` param.
- **No per-field privacy engine.** Visibility is per-career-section only; profile fields are all-public or all-private.
- **No event bus or message broker.** Synchronous handling satisfies the contract (10.4).
- **No push or email delivery.** No transport exists in the frontend.
- **No profile customization beyond the six career flags.**
- **No multi-tenancy, orgs, or teams.**
- **No API versioning.** No version segment appears in any path.
- **No rate limiting on reads.** The frontend only needs it on auth and upload.
- **No GraphQL.** REST + JSON throughout.

### 18.3 Boundary note

This document stops at requirements. No entity, table, migration, endpoint, DTO, or service was created, and the existing backend was not modified. Section 13 records what already exists; sections 1–12 and 14–17 describe the target.

---

## 19. Open Questions / Decisions Required

Ordered by risk. **Q1–Q4 are blocking** — building on the current contract without resolving them produces data exposure or a feature that cannot function.

### Blocking

**Q1 — Are `phoneNumber` and `accountNumber` public?**
Both appear in `PublicProfileResponse`, which would expose a phone number to every anonymous visitor. `accountNumber` additionally has **no identified purpose** anywhere in the product. Nothing reads, validates, or displays it beyond form pass-through.
*Impact:* irreversible disclosure once published. *Recommendation:* treat both as private; remove from the public response; investigate whether `accountNumber` should exist at all.

**Q2 — What should `GET /api/profiles` return?**
The endpoint is anonymous but expects `ProfileDetailsResponse[]`, which includes `email`, `avatarKey`, `phoneNumber`, `accountNumber`, `createdAt`, `updatedAt` for every profile.
*Impact:* mass disclosure of every user's email. *Recommendation:* return `PublicProfileResponse[]` and require authentication, or remove the endpoint if no screen needs it.

**Q3 — What is the notifications model?**
No entity, no endpoint, no read persistence. The page reads `GET /api/admin/broadcasts`, and `scope: "direct_user"` implies per-recipient read state that does not exist.
*Decision needed:* introduce a user-scoped notification read endpoint, or formally descope notifications and delete the page. Also confirm whether `direct_user` broadcasts are in scope — they are the only reason per-recipient state is needed.

**Q4 — Why is verification evidence collected but never shown?**
`VerificationRequestDto` accepts `identificationNumber`, `websiteUrl`, `portfolioUrl`, `documentUrl`, `category`. `VerificationRequestItem` — the admin read model — has none of them. Admins literally cannot see what applicants submitted.
*Decision needed:* is the evidence retained and simply missing from the read model, or is it collected and discarded? If retained, does `documentUrl` imply a document upload flow, which has no endpoint?

### High

**Q5 — Is content reporting in scope?**
`ContentReportItem` is admin-read with no submit path. The moderation queue cannot be populated by user action.
*Decision needed:* build reporting, or descope it. If reporting is out, `GET /api/admin/reports` and `post_hidden` have no producer.

**Q6 — Should admin lists be paginated?**
All 5 admin list endpoints return bare arrays with no filters beyond `search`/`status`/`role`, and `/admin/audit-logs` has none at all.
*Impact:* will fail on realistic data volumes. *Recommendation:* adopt `PaginatedList<T>` for admin lists. *Note:* this is a frontend-visible change.

**Q7 — What does account deletion do?**
`/settings/security/delete-account` exists with no endpoint. Undefined: hard vs soft delete, cascade to posts/career/media, whether the username is released, whether the profile URL 404s or redirects, whether audit records survive.
*Recommendation:* soft-delete the user, retain moderation history, release or reserve the username deliberately, and reclaim storage.

**Q8 — `isBanned` or `UserStatus`?**
Two overlapping representations: `isBanned: boolean` + `banReason` on user types, and `UserStatus: "active" | "suspended" | "pending_review"` on admin types. Only ban/unban are operable; `suspended` and `pending_review` are settable by nothing.
*Decision needed:* one field, or two? If two, what sets `suspended` and `pending_review`?

### Contract decisions

**Q9 — `POST` or `PUT` for publish/unpublish?** (D1)
Frontend sends **POST** (`apiClient.posts.ts:122,129`); backend maps **PUT** (`PublishPost.cs:16`, `UnpublishPost.cs:16`). This is a **live integration break** — the feature is broken today.
*Recommendation:* `POST` for a state transition is more correct than `PUT`, and the frontend is the consumer that must keep working. Requires a backend change.

**Q10 — Should the backend accept `status` as a string?** (D5)
`apiClient.posts.ts:86` sends `status.toString()` → `"0"`, `"1"`, `"2"`. The backend must parse string or numeric enum values. *Recommendation:* accept both.

**Q11 — Which reorder payload shape?** (D6)
Both `ReorderPostImagesRequest` and `ReorderSocialLinksRequest` declare two alternates (`items`/`orderedImageIds`, `items`/`orderedIds`) and send only one. *Decision needed:* pick one, or accept both.

**Q12 — What is `category` on `GET /api/posts/explore`?**
Sent as a filter, but `Post` has no category field. Derived from tags, or dead parameter?

**Q13 — `storageKey` vs `url`: which is authoritative?**
Both stored, both returned. If `url` is denormalized it can go stale; if both are needed their lifetimes differ. *Recommendation:* store the key only and resolve the URL at read time.

**Q14 — Is `GET /api/posts/{id}` anonymous for drafts?**
The frontend omits `requiresAuth: false`, so it sends a token when present, but the backend has no endpoint. Must return `404` (not `403`) for others' drafts, to avoid confirming existence.

**Q15 — How do admins and curators differ?**
`Curator` is a declared role with no defined permission set. Section 6 marks these cells "Partial" and "Undecided" because the frontend gives no signal. *Decision needed:* an explicit permission matrix. Also: may admins act on resources they own, and may they modify other admins?

### Validation decisions

**Q16 — What are the input limits?**
Only `description` (2000) and `tags` (10) are confirmed. `title` has **no** max length in the editor, which is the most prominent field on a post.
*Decision needed:* limits for username, password, email normalization, `title`, `bio`, `specialty`, social-link `platform` allowlist, `externalUrl`, tag length, image count per post, avatar dimensions, `gpa` format, and the free-text `employmentType` / achievement `type` / skill `category` allowlists.

**Q17 — Are the free-text enums actually enums?**
`employmentType`, achievement `type`, `SkillCategory`, `LanguageProficiency` are string unions in TypeScript but the backend stores strings. `platform` on social links is entirely free-form.
*Decision needed:* fix the allowed sets, or accept arbitrary strings. Note `LanguageProficiency` is typed `LanguageProficiency | string`, which makes the union unenforceable.

### Lower priority

**Q18 — Register accepts `avatarUrl`, but the avatar flow is a 3-step upload.** Is `avatarUrl` at registration used? If not, remove it.

**Q19 — Is refresh used?** `POST /api/auth/refresh` exists in the backend with no frontend call site, and no client refresh-on-401. Needed for session extension, or dead code?

**Q20 — Should `getCurrentUser` distinguish errors?** (D7) It returns `null` on any failure, so a 500 looks identical to a logged-out user. Acceptable, or should the caller see failures?

**Q21 — Is a `PostLike` entity confirmed?** (section 14.3) Inferred from `{isLiked, likeCount}`. Also: can an anonymous visitor like? The frontend requires auth, so no — confirm.

**Q22 — What makes a creator "active"?** `activeCreatorsCount` on the dashboard has no defined window or criteria.

**Q23 — What are `thumbnailUrl` and `imageCount` derived from?** `thumbnailUrl` implies generated image variants with no producer endpoint.

**Q24 — How do career `mediaUrl` fields work?**
Plain strings with no upload endpoint, while `StorageTelemetry` counts `documentsBytes`. Third-party link, or untracked direct upload?

**Q25 — What are the orphan-expiry and moderation-retention policies?**
A key issued at step 1 of the upload flow but never registered is orphaned. Neither objects nor audit logs have a stated retention policy.

---

### Requirement Confidence

Confidence in each requirement's **fidelity to the frontend's actual behavior** — not confidence that the requirement is a good product decision.

| Level | Meaning | Where it dominates |
|---|---|---|
| **High** | Directly evidenced by wired code: a real HTTP call, an explicit type, or a visible validation rule | All 39 `EXISTING` endpoints; all type-derived field lists; `description`/`tags` limits; `PostStatus` values; the upload 3-step protocol; the `PaginatedList` shape |
| **Medium** | Evidenced by UI presence and consumed state, but with no contract or a partial one | Career (28 ops — types are explicit, endpoints untested); Admin (19 ops — types explicit); avatar/post image flows; `ProblemDetails` error shape; ownership model |
| **Low** | Reconstructed from a gap, a type that lacks a counterpart, or a design necessity | `PostLike` entity; per-recipient broadcast read state; notification model; document upload; thumbnail generation; `storageKey`/`url` relationship; user deletion semantics; `category` derivation; "active creator" definition |

**Overall confidence: High for the existing Auth/Profile/Posts/SocialLinks surface; Medium for Career and Admin; Low for Notifications.**

**Strongest evidence:** `apiClient.*.ts` contains the complete request/response contract for 79 operations, with explicit types. This is unusually good requirements source material.

**Weakest evidence:** anything derived from absence. Where a type exists with no endpoint, the **absence is the only evidence** — a missing endpoint may mean out of scope, not yet built, or deliberately descoped. Q1–Q5 are all absence-based and are exactly the questions most likely to be misread.

**What would change the assessment:**
- Product answers to Q1–Q4 (blocking; they alter the public/private model and the notification scope)
- Enabling `VITE_USE_MOCK_API=false` and exercising the real API — the single highest-value next step, because it converts 39 `EXISTING` assumptions and 6 `DEFECT` findings into observed behavior
- A decision on Q9 (verb mismatch), which is a confirmed live break
- Any frontend change to types, since the types *are* the contract

**Explicitly not verified:** the existing backend was inventoried but its runtime behavior, database schema, and authorization enforcement were not tested. The 39 `EXISTING` marks reflect the presence of endpoint files with matching paths and methods — not confirmed conformance. Where frontend and backend disagree, only the mismatches listed in section 12.2 were found; the inventory is not a proof of parity.
