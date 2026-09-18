# Showcase Portfolio Platform

## 1. Project Overview

Showcase Portfolio is a visual portfolio platform where users can create an account, build a personal profile, and showcase their work through visual posts.

The platform is inspired by the visual browsing experience of platforms such as VSCO, but its purpose is not to build a social network. The main purpose is simple:

**Give people a place where they can create a public profile and visually present their work.**

The platform can be used for any type of work, including:

- Software projects
- UI/UX designs
- Photography
- Graphic design
- Branding
- Illustrations
- Artwork
- Architecture
- Other creative or professional work

Users can publish posts containing images and information about their work. Other visitors can explore published work and visit the creator's public profile.

## 2. Core Experience

The main user journey is:

```text
Create Account
      ↓
Create Profile
      ↓
Add Bio & Social Links
      ↓
Create Post
      ↓
Upload Images
      ↓
Add Work Information
      ↓
Publish
      ↓
Appear in Explore
      ↓
Visitors Discover the Work
      ↓
Visitors Visit the Creator's Profile
```

The system should focus on this experience and avoid unnecessary social-network functionality.

## 3. Core Features

### Authentication

Users can:

- Register
- Login
- Logout
- Refresh their access token
- Access protected resources
- Manage their authenticated session

Authentication is implemented using:

- ASP.NET Core Identity
- JWT Access Tokens
- Refresh Tokens
- Authorization

Identity-related implementation remains in the Infrastructure layer.

## 4. User Profile

Every registered user has a profile. The profile contains information such as:

- First name
- Last name
- Username
- Bio
- Avatar
- Social links

The profile is publicly accessible so visitors can discover the creator and their work.

**Example:**

> **/u/john**
>
> **John Doe**
> Full-stack developer building web applications.
>
> GitHub | LinkedIn | Website
>
> **Showcase**
> [ Work ] [ Work ] [ Work ]

## 5. Social Links

Users can add multiple social or external links to their profile.
Instead of hardcoding specific platforms such as GitHub or LinkedIn into the profile entity, links are represented as separate `SocialLink` entities.

A social link contains:

- Platform name
- URL
- Optional display order

This allows the platform to support different types of links without modifying the Profile entity.
_Examples: GitHub, LinkedIn, Instagram, X, Personal Website, Behance, Dribbble, Custom Link._

## 6. Posts

`Post` is the main content entity of the platform. A user can create multiple posts to present their work.

A post can contain:

- Title
- Description
- Images
- External URL
- Publication state
- Creation date
- Publication date

The exact fields should remain focused on presenting the work rather than turning the entity into a social-media post.

**Example:**

> **My E-Commerce Platform**
> A modern e-commerce platform built with ASP.NET Core and React.
>
> [Image]
> [Image]
> [Image]
>
> Live Project | GitHub

## 7. Post Images

A post can contain multiple images. Each image contains:

- Image URL or storage key
- Display order
- Post reference

The display order allows users to control how their work is presented.

**Example:**

```text
Post
    │
    ├── Image 1
    ├── Image 2
    └── Image 3
```

## 8. Explore

The platform provides a simple Explore experience. Visitors can browse publicly available posts.

The initial Explore functionality focuses on:

- Recently published work
- Pagination
- Basic search
- Opening post details
- Opening the creator's profile

The Explore system is intentionally simple. It does not use a social-media recommendation algorithm.

## 9. Public Post

Every published post has a public page. A post page displays:

- Post images
- Title
- Description
- Creator
- External links
- Publication information

Visitors can navigate from a post to the creator's public profile.

## 10. Public Profile

Every user has a public profile. The profile displays:

- Avatar
- Name
- Bio
- Social links
- Published posts

Private or unpublished content should not be visible to public visitors.

## 11. Post Lifecycle

A post should support a simple publishing lifecycle.

```text
Draft
  │
  ▼
Published
  │
  ▼
Unpublished
```

Users can prepare their work before making it publicly visible. Deleted content should not be exposed through public endpoints.

## 12. Image Storage

The application uses Cloudflare R2 as the object storage layer for user-uploaded images. R2 is used for:

- Profile avatars
- Post images

The application database should not store image binary data. Instead:

```text
React
   │
   │ Upload
   ▼
Cloudflare R2
   │
   │ Object URL / Key
   ▼
Database
```

The database stores only the information required to reference the stored object.
For example:

- **Profile:** `AvatarKey`
- **PostImage:** `StorageKey`, `DisplayOrder`

The actual image files remain in Cloudflare R2. The backend is responsible for controlling access, generating upload information when needed, validating ownership, and managing stored objects.

## 13. Domain Entities

The initial Domain model intentionally contains only four core entities:

1. `Profile`
2. `SocialLink`
3. `Post`
4. `PostImage`

### Profile

Represents the public portfolio profile of a user.

- **Responsibilities:** Personal profile information, Biography, Avatar reference, User ownership.
- **Relationship:**
  - Profile 1 ──── \* SocialLink
  - Profile 1 ──── \* Post

### SocialLink

Represents an external link belonging to a profile.

- **Responsibilities:** Platform, URL, Display order, Profile ownership.
- **Relationship:** Profile 1 ──── \* SocialLink

### Post

Represents a piece of work published by a user.

- **Responsibilities:** Title, Description, Publication state, External links, Ownership, Post images.
- **Relationship:**
  - Profile 1 ──── \* Post
  - Post 1 ──── \* PostImage

### PostImage

Represents an image belonging to a post.

- **Responsibilities:** Storage key, Display order, Post ownership.
- **Relationship:** Post 1 ──── \* PostImage

## 14. Domain Boundary

ASP.NET Core Identity should not be part of the Domain layer. The Identity implementation belongs to Infrastructure.

**Domain Layer:**

```text
Domain
│
├── Profile
├── SocialLink
├── Post
└── PostImage
```

**Infrastructure Layer:**

```text
Infrastructure
│
├── Identity
│   └── ApplicationUser
│
├── Authentication
│   ├── JWT
│   └── Refresh Tokens
│
├── Persistence
│   └── EF Core
│
└── Storage
    └── Cloudflare R2
```

The Domain remains independent from ASP.NET Core Identity, EF Core, PostgreSQL, Cloudflare R2, JWT, and HTTP.

## 15. Technology Stack

**Backend:**

- ASP.NET Core
- Minimal APIs
- ASP.NET Core Identity
- JWT Authentication (Access Tokens, Refresh Tokens)
- Authorization
- Entity Framework Core
- PostgreSQL
- CQRS & MediatR
- Clean Architecture

**Storage:**

- Cloudflare R2 for uploaded images and avatars

**Frontend:**

- React
- TypeScript
- Axios
- TanStack Query
- Zustand
- Tailwind CSS
- React Router

## 16. Architecture

The backend follows Clean Architecture with CQRS and feature-oriented organization.

```text
API
 │
 ├── Application
 │      │
 │      └── Domain
 │
 └── Infrastructure
        │
        ├── Application
        └── Domain
```

- **Domain:** Has no dependency on other layers.
- **Application:** Contains the business use cases (Commands, Queries, Handlers, Validators, DTOs, Behaviors).
- **Infrastructure:** Contains technical implementations (EF Core, PostgreSQL, Identity, JWT, Refresh Tokens, Cloudflare R2, Authentication services).
- **API:** Contains Minimal API endpoints, HTTP configuration, Endpoint authorization, Request/response handling.

## 17. Frontend Architecture

The React frontend communicates with the backend through Axios. TanStack Query manages server state. Zustand manages client-side state that does not belong to the server cache.

```text
React
 │
 ├── Pages
 ├── Features
 ├── Components
 │
 ├── TanStack Query
 │      │
 │      └── Axios
 │             │
 │             ▼
 │         ASP.NET API
 │
 └── Zustand
       │
       └── Client State
```

The frontend should keep API communication, server state, client state, UI components, and feature logic separated.

## 18. Explicitly Out of Scope

The first complete version of the platform does not include social-network interactions. The following are intentionally excluded:

- Likes
- Comments
- Followers
- Following
- Saved posts
- Direct messages
- Chat
- Social notifications
- Recommendation algorithms
- Complex feed ranking

The platform is a showcase and discovery platform, not a social network.

## 19. Final Product Definition

Showcase Portfolio is a visual portfolio platform where people can create a profile, present their work through image-based posts, add social links, and make their work discoverable through a simple Explore experience.

The system focuses on four core domain concepts: `Profile`, `SocialLink`, `Post`, and `PostImage`.

User authentication is handled through ASP.NET Core Identity and JWT authentication, PostgreSQL is used as the relational database, and Cloudflare R2 is used for image and avatar storage. The goal is to build a clean, focused, and production-oriented portfolio platform without unnecessary social-network complexity.

## 20. Backend Technical Implementation Plan

### 20.1 Architectural Strategy

The backend adheres strictly to the 4-layer Clean Architecture (.NET 10, C# 14) defined in `README.md` and governed by the `.gemini/skills`:

- **Domain (`Showcase.Domain`)**: Pure C# domain model with zero external dependencies and zero identity packages. Encapsulates business logic through **Aggregates** (`ProfileAggregate`, `PostAggregate`), **Value Objects** (`Username`, `Bio`, `Url`, `StorageKey`), and typed domain `Error` objects using the Result pattern.
- **Application (`Showcase.Application`)**: CQRS vertical slices using MediatR and FluentValidation. Defines service abstractions (`IApplicationDbContext`, `ITokenService`, `ICurrentUserService`, `IStorageService`) and orchestrates aggregate behaviors.
- **Infrastructure (`Showcase.Infrastructure`)**: Technical persistence and external integrations. Contains ASP.NET Core Identity in `Identity/ApplicationUser.cs`, linked via EF Core 1-to-1 relationship to `Profile`. Configured for PostgreSQL (`Npgsql.EntityFrameworkCore.PostgreSQL`), Cloudflare R2 storage via AWS S3 SDK (`AWSSDK.S3`), and JWT Bearer authentication with token rotation.
- **API (`Showcase.Api`)**: Minimal API endpoints implementing `IEndpoint` with auto-discovery (`MapEndpoints()`), standardized RFC 7807 ProblemDetails mapping via `ResultExtensions.ToResponse()`, and global exception handling.

---

### 20.2 Domain Layer (`Showcase.Domain`)

#### Value Objects (`ValueObjects/`):

- **`Username`**: Immutable record enforcing validated lowercase slug (3–30 characters, alphanumeric + hyphens/underscores).
- **`Bio`**: Immutable record encapsulating bio text (max 500 characters).
- **`Url`**: Immutable record validating absolute HTTP/HTTPS web addresses.
- **`StorageKey`**: Immutable record validating non-empty Cloudflare R2 object keys.

#### Enums (`Enums/`):

- **`PostStatus`**: `Draft = 0`, `Published = 1`, `Unpublished = 2`.

#### Aggregates (`Aggregates/`):

1. **`ProfileAggregate`**:
   - **`Profile` (Aggregate Root)**:
     - `Guid Id` (BaseEntity), `string UserId` (Identity user link), `Username Username`, `string FirstName`, `string LastName`, `Bio? Bio`, `StorageKey? AvatarKey`, `DateTime CreatedAt`, `DateTime? UpdatedAt`.
     - Encapsulated collection: `IReadOnlyCollection<SocialLink> SocialLinks`.
     - Methods: `UpdateDetails(...)`, `SetUsername(...)`, `SetAvatar(...)`, `RemoveAvatar()`, `AddSocialLink(...)`, `UpdateSocialLink(...)`, `RemoveSocialLink(...)`, `ReorderSocialLinks(...)`.
     - Errors: `ProfileErrors` (`NotFound`, `UsernameTaken`, `InvalidUsername`).
   - **`SocialLink` (Child Entity)**:
     - `Guid Id` (BaseEntity), `Guid ProfileId`, `string Platform`, `Url Url`, `int DisplayOrder`.
     - Errors: `SocialLinkErrors` (`NotFound`, `InvalidUrl`).

2. **`PostAggregate`**:
   - **`Post` (Aggregate Root)**:
     - `Guid Id` (BaseEntity), `Guid ProfileId`, `string Title`, `string Description`, `Url? ExternalUrl`, `PostStatus Status`, `DateTime CreatedAt`, `DateTime? PublishedAt`, `DateTime? UpdatedAt`.
     - Encapsulated collection: `IReadOnlyCollection<PostImage> Images`.
     - Methods: `UpdateDetails(...)`, `Publish()` (enforces invariant: requires `>= 1` image), `Unpublish()`, `AddImage(...)`, `RemoveImage(...)`, `ReorderImages(...)`.
     - Errors: `PostErrors` (`NotFound`, `CannotPublishEmptyPost`, `UnauthorizedAccess`).
   - **`PostImage` (Child Entity)**:
     - `Guid Id` (BaseEntity), `Guid PostId`, `StorageKey StorageKey`, `int DisplayOrder`, `DateTime CreatedAt`.
     - Errors: `PostImageErrors` (`NotFound`).

---

### 20.3 Infrastructure Layer (`Showcase.Infrastructure`)

#### Identity (`Identity/`):

- **`ApplicationUser`**: Extends `IdentityUser`.
  - Properties: `FirstName`, `LastName`, `RefreshToken`, `RefreshTokenExpiryTime`.
  - **1-to-1 Connection**: `Guid ProfileId`, navigation property `Profile Profile`.
- **`TokenService`**: Implements `ITokenService` for JWT generation and refresh token rotation.
- **`CurrentUserService`**: Implements `ICurrentUserService` via `IHttpContextAccessor`.
- **`JwtSettings`**: Configuration options for secret, issuer, audience, and expiration.

#### Storage (`Storage/`):

- **`R2Settings`**: Section `CloudflareR2` (`AccountId`, `AccessKeyId`, `SecretAccessKey`, `BucketName`, `PublicUrlPrefix`).
- **`CloudflareR2StorageService`**: Implements `IStorageService` using `AWSSDK.S3` for presigned PUT URLs, public URLs, and object deletions.

#### Data & Configurations (`Data/`):

- **`ApplicationDbContext`**: Extends `IdentityDbContext<ApplicationUser>`, implements `IApplicationDbContext`.
  - `DbSet<Profile> Profiles => Set<Profile>();`
  - `DbSet<SocialLink> SocialLinks => Set<SocialLink>();`
  - `DbSet<Post> Posts => Set<Post>();`
  - `DbSet<PostImage> PostImages => Set<PostImage>();`
- **Configurations (`Data/Configurations/`)**:
  - `ApplicationUserConfiguration`: Configures 1-to-1 relationship between `ApplicationUser` and `Profile` (`HasForeignKey<Profile>(p => p.UserId)` with Cascade delete).
  - `ProfileConfiguration`: ComplexProperty mapping for `Username`, `Bio`, `AvatarKey`, unique index on `Username` and `UserId`.
  - `SocialLinkConfiguration`: FK to `Profile`, ComplexProperty for `Url`.
  - `PostConfiguration`: FK to `Profile`, ComplexProperty for `ExternalUrl`, indexes on `Status` and `PublishedAt`.
  - `PostImageConfiguration`: FK to `Post`, ComplexProperty for `StorageKey`.
- **DependencyInjection**: Registers Npgsql PostgreSQL connection, Identity stores, JWT Bearer authentication, and infrastructure services.

---

### 20.4 Application Layer (`Showcase.Application`)

Organized in vertical slices using MediatR:

- **`Features/Auth/`**:
  - `Register`: Creates `ApplicationUser` and initializes `Profile` aggregate; returns `AuthResponse`.
  - `Login`: Authenticates user, returns tokens.
  - `RefreshToken`: Rotates refresh token.
  - `GetCurrentUser`: Context and Profile ID.
- **`Features/Profiles/`**:
  - `UpdateProfile`, `GetAvatarUploadUrl`, `UpdateAvatar`, `GetMyProfile`, `GetPublicProfile`.
- **`Features/SocialLinks/`**:
  - `AddSocialLink`, `UpdateSocialLink`, `DeleteSocialLink`, `ReorderSocialLinks` (dispatched through `Profile` aggregate root).
- **`Features/Posts/`**:
  - `CreatePost`, `UpdatePost`, `PublishPost`, `UnpublishPost`, `DeletePost`.
  - `GetPostImageUploadUrl`, `AddPostImage`, `RemovePostImage`, `ReorderPostImages` (dispatched through `Post` aggregate root).
  - `GetPostById`, `GetMyPosts`, `GetExplorePosts`, `GetProfilePosts`.

---

### 20.5 API Layer (`Showcase.Api`)

Minimal API endpoints implementing `IEndpoint` with auto-discovery:

- `/api/auth/register`, `/api/auth/login`, `/api/auth/refresh`, `/api/auth/me`
- `/api/profiles/me`, `/api/profiles/me/avatar/upload-url`, `/api/profiles/me/avatar`, `/api/profiles/{username}`, `/api/profiles/{username}/posts`
- `/api/profiles/me/social-links`, `/api/profiles/me/social-links/{id:guid}`, `/api/profiles/me/social-links/reorder`
- `/api/posts`, `/api/posts/{id:guid}`, `/api/posts/{id:guid}/publish`, `/api/posts/{id:guid}/unpublish`, `/api/posts/{id:guid}/images/upload-url`, `/api/posts/{id:guid}/images`, `/api/posts/{id:guid}/images/reorder`, `/api/posts/mine`, `/api/posts/explore`

---

### 20.6 Verification & Testing Strategy

1. **Compilation**: `dotnet build Showcase.slnx --configuration Release`.
2. **Migrations**: `dotnet ef migrations add InitialShowcasePostgreSqlSchema --project Showcase.Infrastructure --startup-project Showcase.Api`.
3. **End-to-End Scenarios**: Verification via `.http` tests covering user registration, 1-to-1 profile binding, aggregate invariant enforcement (publishing validation), presigned R2 image upload, and public explore feed retrieval.
