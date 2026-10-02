# Google OAuth 2.0 Authentication Integration

## Context & Problem
To enable fast onboarding and secure social login, Google OAuth 2.0 was integrated into both the ASP.NET Core backend and React frontend. The goal was to securely authenticate users, provision new accounts with automated handle and profile generation, and issue HttpOnly SameSite=Lax JWT and refresh token session cookies without exposing access tokens in URL parameters or local storage.

## Architectural Decisions
1. **Direct Authorization Code Flow**: Handled directly in ASP.NET Core via `HttpClient` exchanging the authorization code with `https://oauth2.googleapis.com/token` and retrieving verified user profile details from `https://openidconnect.googleapis.com/v1/userinfo`.
2. **Automated User & Profile Provisioning**:
   - Matches existing accounts by external login key (`sub`) or email address.
   - For new users, generates a sanitized unique username handle from the email prefix, assigns the `Member` role, links the Google external login, and creates a corresponding domain `Profile` entity with name and avatar.
3. **Session Cookie Issuance**: On successful verification, issues `showcase_access_token` and `showcase_refresh_token` as HttpOnly SameSite=Lax cookies, then redirects directly to the frontend studio target.

## Affected Files
- `Showcase.Api/appsettings.json`: Added `GoogleAuth` credentials and redirect URIs.
- `Showcase.Infrastructure/Identity/GoogleAuthSettings.cs`: Created options class for binding.
- `Showcase.Infrastructure/DependencyInjection/DependencyInjection.cs`: Registered `AddHttpClient()` and `GoogleAuthSettings`.
- `Showcase.Application/Common/Interfaces/IIdentityService.cs`: Added `GetOrCreateExternalUserAsync` method signature.
- `Showcase.Infrastructure/Identity/IdentityService.cs`: Implemented external user discovery, handle deduplication, and profile creation.
- `Showcase.Api/Endpoints/Auth/GoogleLogin.cs`: Endpoint `GET /api/auth/google` for consent screen redirection.
- `Showcase.Api/Endpoints/Auth/GoogleCallback.cs`: Endpoint `GET /api/auth/google/callback` for token exchange and cookie setting.
- `Showcase.ClientApp/src/features/auth/hooks/useLoginForm.ts`: Connected Google login action and added query error parsing.
- `Showcase.ClientApp/src/features/auth/components/CredentialsStep.tsx`: Added Google register button to onboarding wizard.

## Verification
- Backend compilation: `dotnet build` succeeded with 0 errors and 0 warnings.
- Frontend compilation: `npm run build` succeeded with 0 errors.
- Live API verification: Verified `GET /api/auth/google` returns `302 Found` with correctly encoded Google OAuth parameters.
- Error handling verification: Verified `GET /api/auth/google/callback?error=access_denied` redirects cleanly to `/login?error=access_denied` and frontend displays user-friendly message.
