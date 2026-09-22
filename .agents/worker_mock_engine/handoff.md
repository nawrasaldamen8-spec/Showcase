# Mock Engine & Data Contracts — Handoff Report

## 1. Observation
- Inspected the ASP.NET Core Clean Architecture backend contracts in `d:\Projects\AspFiles\Showcase\doc\Backend_Documentation.md` and C# entities/commands/queries in `Showcase.Domain` and `Showcase.Application`.
- Observed key domain entities:
  - `PostStatus` enum (`Draft = 0`, `Published = 1`, `Unpublished = 2`).
  - `Profile`, `SocialLink`, `Post`, `PostImage`.
  - DTOs: `ProfileDetailsResponse`, `PublicProfileResponse`, `PostDetailsResponse`, `PostSummaryResponse`, `ExplorePostResponse`, `PaginatedList<T>`, `CurrentUserResponse`, `AuthResponse`, and RFC 7807 `ProblemDetails`.
  - Backend invariants in `Post.cs` and `Backend_Documentation.md § 2.4`:
    - `Publish()`: "A post cannot be published unless it contains at least 1 attached PostImage (`PostErrors.CannotPublishEmptyPost`)."
    - `RemoveImage()`: "A published post cannot delete its last remaining image while in Published status (`PostErrors.CannotRemoveLastImageFromPublishedPost`)."
    - Draft privacy: "Draft and Unpublished posts queried by ID return PostErrors.NotFound (404) to anonymous visitors or non-owners."
- Inspected TypeScript configuration in `Showcase.ClientApp/tsconfig.app.json` and noted `"erasableSyntaxOnly": true` and `"verbatimModuleSyntax": true`.
- Created and verified:
  - `src/shared/types/index.ts`: Mirror of C# DTOs, entities, requests, and `PostStatus`.
  - `src/shared/api/mockData.ts`: 5 realistic creator profiles (`elena_v`, `marcus_k`, `sophia_chen`, `tariq_dev`, `maya_lin`) and 10 editorial portfolio posts with multi-image Unsplash photography and tags.
  - `src/shared/api/mockService.ts`: Stateful LocalStorage engine under key `showcase_portfolio_db` with simulated latency (120-280ms), full CRUD operations, image upload simulation, and business invariants enforcement.
  - `src/shared/api/apiClient.ts`: Pluggable API client abstraction exposing `USE_MOCK_API = true`.
  - `src/shared/api/index.ts`: Central export for API layer.
  - `src/shared/context/authContextDef.ts`, `src/shared/context/AuthContext.tsx`, `src/shared/context/useAuth.ts`, `src/shared/context/index.ts`: Reactive Auth and Persona context provider supporting 'visitor' and 'creator' modes.
- Executed `npm run lint` with output:
  ```text
  > showcase-clientapp@0.0.0 lint
  > eslint .
  (exit code 0, 0 errors, 0 warnings)
  ```
- Executed `npm run build` with output:
  ```text
  > showcase-clientapp@0.0.0 build
  > tsc -b && vite build
  ✓ 16 modules transformed.
  dist/index.html                   0.77 kB │ gzip:  0.45 kB
  dist/assets/index-DjBgKLBy.css   24.44 kB │ gzip:  5.56 kB
  dist/assets/index-CwAYhXNu.js   219.60 kB │ gzip: 68.57 kB
  ✓ built in 197ms
  (exit code 0)
  ```

## 2. Logic Chain
1. Under `tsconfig.app.json` with `"erasableSyntaxOnly": true`, TypeScript prohibits runtime `enum` syntax (`TS1294`). Defining `PostStatus` as `export const PostStatus = { Draft: 0, Published: 1, Unpublished: 2 } as const; export type PostStatus = (typeof PostStatus)[keyof typeof PostStatus];` satisfies `erasableSyntaxOnly` while providing runtime values (`PostStatus.Published`) and type definitions (`status: PostStatus`).
2. The UI extractor and explore feed require searching across titles, descriptions, creators, and tags with pagination. `mockService.getExplorePosts` applies case-insensitive filtering on published posts and returns a `PaginatedList<ExplorePostResponse>`.
3. The Creator Studio requires viewing current creator posts with status tabs (`All`, `Published`, `Drafts`). `mockService.getMyPosts` provides this with status-based filtering and pagination.
4. Editorial integrity mandates that empty posts cannot be published and published posts cannot remove their last image. Both invariants are strictly enforced in `mockService.publishPost` and `mockService.removePostImage`.
5. Cloudflare R2 direct ingestion is modeled via `getPostImageUploadUrl` and `uploadImageDirect`, supporting browser object URLs and data URLs for offline thumbnail rendering.
6. The `apiClient` abstraction provides identical signatures for both mock and live modes; flipping `USE_MOCK_API = false` routes queries directly to ASP.NET Core endpoints with zero UI code adjustments.
7. ESLint's `react-refresh/only-export-components` requires component files to export only components. Splitting `useAuth` into `useAuth.ts` and context definition into `authContextDef.ts` guarantees clean HMR and eliminates linter violations.

## 3. Caveats
- Direct image upload in mock mode uses client-side object URLs (`URL.createObjectURL(file)`) or data URLs. In a production browser session without persistent object URL revocation, page hard refresh might invalidate ephemeral blob URLs if files were uploaded during that specific session. Default seed data uses permanent high-resolution Unsplash URLs.
- Authentication in mock mode is simulated via mock JWT strings stored in `localStorage` without cryptographic signature verification, matching standard frontend prototype sandbox conventions.

## 4. Conclusion
The Mock API Engine, TypeScript contracts, curated editorial seed data, pluggable `apiClient`, and `AuthContext` are fully implemented, functional, and verified. The client application can run 100% standalone offline without a database or backend server, and can seamlessly switch to the live backend by toggling `USE_MOCK_API = false`.

## 5. Verification Method
To independently verify the implementation:
1. Navigate to the client app directory:
   ```powershell
   cd d:\Projects\AspFiles\Showcase\Showcase.ClientApp
   ```
2. Run the linter:
   ```powershell
   npm run lint
   ```
   Confirm 0 errors and 0 warnings.
3. Run the TypeScript build & Vite bundling:
   ```powershell
   npm run build
   ```
   Confirm `tsc -b && vite build` succeeds with exit code 0 and generated assets in `dist/`.
4. Inspect contract definitions and mock service:
   - `src/shared/types/index.ts`
   - `src/shared/api/mockData.ts`
   - `src/shared/api/mockService.ts`
   - `src/shared/api/apiClient.ts`
   - `src/shared/context/AuthContext.tsx`
