# Changelog: Fix 401 Unauthorized On Boot & Improve Auth Error Handling

**Date:** 2026-09-30  
**Topic:** Auth Handshake & 401 Diagnostics

## Problem
1. App load triggered an unauthenticated `GET /api/auth/me` returning HTTP 401 Unauthorized in console because `activePersona` defaulted to `'creator'` even with no token present.
2. Login error banner rendered generic Axios error strings (`"Request failed with status code 401"`) instead of user-friendly validation and credential messages.

## Solution
1. In `src/shared/api/apiClient.auth.ts`, `getCurrentUser()` returns `null` immediately without firing a network call if no token exists in storage.
2. In `src/shared/context/AuthContext.tsx`, `activePersona` defaults to `'visitor'` when no token exists, preventing unauthenticated network requests on initial app boot.
3. In `src/shared/api/axiosClient.ts`, updated `extractApiErrorMessage` to intercept status codes (401, 403, 404) and generic Axios strings, prioritizing problem details or actionable fallback messages.
4. In `src/features/auth/hooks/useLoginForm.ts` and `src/features/auth/hooks/useRegisterWizard.ts`, integrated `extractApiErrorMessage` so credential failures and validation errors are presented clearly to the user.

## Verification
- `Showcase.Api` built successfully with 0 errors and 0 warnings.
- `Showcase.ClientApp` built production bundle successfully with 0 errors.
