## 2026-09-22T18:57:19Z

You are the Mock Engine Worker.
Your Working Directory: d:\Projects\AspFiles\Showcase\.agents\worker_mock_engine
Client App Working Directory: d:\Projects\AspFiles\Showcase\Showcase.ClientApp

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

STRICT CONSTRAINT: DO NOT create or write unit test suites. Verification MUST be done via `npm run lint` and `npm run build` (tsc compilation and bundling).

READ THESE FIRST:
- d:\Projects\AspFiles\Showcase\.agents\ORIGINAL_REQUEST.md
- d:\Projects\AspFiles\Showcase\.agents\02_mock_engine_agent.agent
- d:\Projects\AspFiles\Showcase\doc\Backend_Documentation.md

YOUR TASKS:
1. Mirror C# DTOs and contracts in `src/shared/types/index.ts`:
   - Enum `PostStatus`: Draft = 0, Published = 1, Unpublished = 2.
   - Entities & DTOs: `Profile`, `SocialLink`, `Post`, `PostImage`, `UserIdentityDetails`, `CurrentUserResponse`, `ProfileDetailsResponse`, `PublicProfileResponse`, `PostDetailsResponse`, `PostSummaryResponse`, `ExplorePostResponse`, `PaginatedList<T>`, `ProblemDetails`, `AuthResponse`.
   - Request DTOs: `RegisterRequest`, `LoginRequest`, `ChangePasswordRequest`, `ChangeEmailRequest`, `ChangeUsernameRequest`, `UpdateProfileRequest`, `AddSocialLinkRequest`, `UpdateSocialLinkRequest`, `ReorderSocialLinksRequest`, `CreatePostRequest`, `UpdatePostRequest`, `ReorderPostImagesRequest`, `UploadUrlResponse`.
2. Create rich curated English seed data in `src/shared/api/mockData.ts`:
   - 4-5 diverse creator profiles with realistic bios, usernames, avatars, and ordered social links (GitHub, LinkedIn, Website, Behance, etc.).
   - 8-10 high-resolution editorial posts (photography, architecture, industrial design, typography) with multi-image galleries (using Unsplash high-res URLs), tags, and publication timestamps. Include a mix of Published and Draft posts.
3. Build Stateful LocalStorage Mock API Engine in `src/shared/api/mockService.ts`:
   - Persistence under key `showcase_portfolio_db`. If empty, initialize with seed data.
   - Full CRUD operations with small simulated async delay (100-300ms) to feel real:
     - Explore feed with search filtering (across title, description, creator name, tags) and pagination.
     - Post details by ID, posts by creator username (`/api/profiles/{username}/posts`), current user's posts (`/api/posts/mine` with status filter All/Published/Drafts).
     - Post creation, update, deletion.
     - Publish post: MUST ENFORCE the backend invariant: a post cannot be published without at least 1 image.
     - Unpublish post.
     - Image upload simulation: presigned upload simulation generating storage keys and direct image upload simulating Cloudflare R2 with object URLs or data URLs.
     - Image reordering (`reorderPostImages`) and image removal (`removePostImage`, preventing removing last image if post is published).
     - Profile details update (`updateProfile`).
     - Avatar upload simulation, update, and deletion.
     - Social links CRUD (add, update, delete, reorder).
     - Account security simulation (changePassword, changeEmail, changeUsername with validation).
4. Create pluggable API Client abstraction in `src/shared/api/apiClient.ts`:
   - Export `USE_MOCK_API = true`.
   - Standardized API client interface allowing switching to live backend with zero UI changes.
5. Create Auth & Persona Context in `src/shared/context/AuthContext.tsx`:
   - Provides `currentUser`, `activePersona` ('visitor' | 'creator'), `switchPersona`, `login`, `logout`, `isAuthenticated`.
   - Syncs with `localStorage` and `Navbar`'s `DemoSwitcher`.
6. Run verification:
   - Execute `npm run lint` and `npm run build` in `d:\Projects\AspFiles\Showcase\Showcase.ClientApp`.
   - Ensure 0 errors.
7. Write a comprehensive handoff report to `d:\Projects\AspFiles\Showcase\.agents\worker_mock_engine\handoff.md`.
8. Send a message to parent notifying completion.
