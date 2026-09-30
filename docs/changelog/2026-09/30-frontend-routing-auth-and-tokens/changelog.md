# Frontend Routing Reorganization, Real Auth State, and Token Lifecycle

**Date:** 2026-09-30  
**Scope:** `Showcase.ClientApp` (Routing, AuthContext, Axios Interceptors, Guards, Layout)

## 1. Objectives & Decisions

1. **Clean Route Separation & Public Access:**
   - **Public Pages:** `/u/:username` (full public profile with Works, Career, About tabs), `/posts/:id` (post details), `/login`, `/register`, `/auth/complete-oauth`, `/terms`, `/privacy`, `/500`, and `404`.
   - **Protected Routes (`ProtectedRoute`):** Redirect unauthenticated visitors to `/login` with `state: { from: location }`. Covers `/studio`, `/posts/mine`, `/posts/new`, `/posts/:id/edit`, `/feed`, `/search`, `/profile/edit`, `/profile/social-links`, `/notifications`, `/settings/*`, `/career/*`.
   - **Protected Admin Routes (`AdminRouteGuard`):** Strict verification of `isAuthenticated` and `isAdmin` role claims, with a dedicated 403 screen for unauthorized users.

2. **Elimination of Mock Persona System:**
   - Removed `activePersona`, `switchPersona`, `PERSONA_STORAGE_KEY`, and `DemoSwitcher.tsx`.
   - Replaced mock state with true backend session resolution via `apiClient.getCurrentUser()`.

3. **Solidification of Token Storage & Axios Interceptors:**
   - Unified token keys in `tokenStorage.ts` (`showcase_auth_token`, `showcase_refresh_token`).
   - Enhanced Axios response interceptor for 401 status to perform concurrent silent token refresh via `/api/auth/refresh` and dispatch `showcase:auth-expired` upon terminal session expiration.

## 2. Modified & Created Files

- `src/shared/context/authContextDef.ts`: Removed `ActivePersona`, defined clean real `AuthContextValue`.
- `src/shared/context/AuthContext.tsx`: Replaced mock persona state with real token and backend user verification.
- `src/shared/context/index.ts`: Updated context exports.
- `src/shared/api/apiClient.auth.ts`: Removed persona-switching helpers.
- `src/shared/api/axiosClient.ts`: Added `showcase:auth-expired` dispatch on terminal 401s.
- `src/shared/components/ProtectedRoute.tsx`: Created new authentication guard component.
- `src/shared/components/index.ts`: Exported `ProtectedRoute`.
- `src/features/admin/components/AdminRouteGuard.tsx`: Removed demo switch buttons, added real auth & role enforcement.
- `src/shared/layout/DemoSwitcher.tsx`: Deleted obsolete mock switcher component.
- `src/shared/layout/Sidebar.tsx`: Removed mock persona properties and switcher.
- `src/shared/layout/SidebarUserMenu.tsx`: Replaced demo buttons with genuine Sign In/Sign Up or Profile/Admin actions.
- `src/shared/layout/index.ts`: Removed `DemoSwitcher` export.
- `src/app/AppLayout.tsx`: Cleaned layout props.
- `src/app/App.tsx`: Reorganized route matrix into public, user-protected, and admin-protected blocks.
- `src/features/auth/hooks/useLoginForm.ts`: Added support for redirecting to target routes via `location.state.from`.
- `src/features/auth/hooks/useRegisterWizard.ts`: Added target route redirection.
- `src/features/auth/pages/CompleteOAuthPage.tsx`: Removed mock persona call.
- `src/features/posts/pages/PostEditorPage.tsx`: Removed obsolete `VisitorGuard` fallback.
- `src/features/posts/pages/StudioDashboardPage.tsx`: Removed obsolete `VisitorGuard` fallback.

## 3. Verification

- `npm run build` executed and passed cleanly in 1.30s without TypeScript errors or broken imports.
