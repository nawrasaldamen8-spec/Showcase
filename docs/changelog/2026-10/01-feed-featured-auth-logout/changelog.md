# Feed Moderation, Public Search, and Authentication & Logout Lifecycle Fixes

## 1. Summary of Decisions and Changes

### 1.1 Community Feed Moderation vs. Global Search Discovery
- **Feed & Explore Feed (`/feed` and `GET /api/posts/explore`)**:
  - Feed query in backend (`GetExplorePostsQueryHandler.cs`) strictly enforces that posts must belong to non-banned, non-deleted users whose creator profile has `FeaturedStatus == FeaturedStatus.Featured` (approved by admin).
  - Community directory (`/feed` via `GET /api/profiles?featuredOnly=true`) filters profiles to only show approved featured creators (`FeaturedStatus.Featured`).
- **Global Search (`/feed/search` via `GET /api/profiles?search=...`)**:
  - Search query searches across all active (non-banned, non-deleted) users matching username, name, bio, or specialty, without requiring `FeaturedStatus.Featured`.
  - Updated `FeedPage.tsx` and `SearchResultsPage.tsx` to handle backend `PaginatedList<PublicProfileResponse>` responses seamlessly.

### 1.2 Login 401 & Unified Token Storage
- Diagnosed 401 Unauthorized during login: occurs when credentials do not match any user in the PostgreSQL database.
- Ensured `tokenStorage` in `Showcase.ClientApp/src/shared/api/tokenStorage.ts` uses consistent keys:
  - `showcase_auth_token` for access token.
  - `showcase_refresh_token` for refresh token.
- Verified that HTTP fetch interceptor attaches `Authorization: Bearer <token>` automatically on all protected requests.

### 1.3 Logout Lifecycle & Token Revocation
- When logout is invoked (`apiClient.logout()`):
  - Sends authenticated `POST /api/auth/logout` to the backend.
  - Backend `LogoutCommandHandler` resets `RefreshToken` and `RefreshTokenExpiryTime` in `ApplicationUser` table, invalidating any future refresh token reuse.
  - Client clears tokens from storage and resets `currentUser` in `AuthContext`.
  - Frontend explicitly redirects to `/login` with `replace: true` across `AppLayout`, `MobileTopBar`, and `DeleteAccountPage`.
  - Unauthenticated attempts to access protected routes (`/studio`, `/career/*`, `/settings/*`, `/notifications`, `/admin/*`) are immediately redirected to `/login` with `location.state.from` preserved.

## 2. Alternatives Considered & Rejected
- **Filtering client-side**: Rejected because downloading all registered profiles to the browser poses security/privacy risks and breaks scalability. Filtering and pagination are executed server-side via EF Core queries.
- **Silent failure on logout**: Rejected. Network errors during logout still clear local token storage to ensure the user is not stuck in a broken authenticated state.
