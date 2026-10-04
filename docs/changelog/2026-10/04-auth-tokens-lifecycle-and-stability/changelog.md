# Authentication Tokens Lifecycle & Session Stability Changelog

**Date:** 2026-10-04  
**Scope:** Backend (.NET 10 Identity & JWT), Frontend (React 19, Axios Client, SignalR), Session Lifecycle.

## Summary of Completed Changes

### 1. Direct Refresh Token Resolution & 1-Hour Drop Fix
- **Direct Validation:** Added `ValidateRefreshTokenDirectAsync` to [`IIdentityService.cs`](file:///d:/Projects/AspFiles/Showcase/Showcase.Application/Common/Interfaces/IIdentityService.cs) and [`IdentityService.cs`](file:///d:/Projects/AspFiles/Showcase/Showcase.Infrastructure/Identity/IdentityService.cs).
- **Access Token Decoupling:** Updated [`RefreshTokenCommandHandler.cs`](file:///d:/Projects/AspFiles/Showcase/Showcase.Application/Features/Auth/Commands/RefreshToken/RefreshTokenCommandHandler.cs) and [`RefreshToken.cs`](file:///d:/Projects/AspFiles/Showcase/Showcase.Api/Endpoints/Auth/RefreshToken.cs) to allow refreshing with only the valid 7-day `showcase_refresh_token` when the 1-hour `showcase_access_token` cookie has expired from browser storage.

### 2. Multi-Tab, HMR & StrictMode Concurrency Grace Period
- **Token Rotation Grace Window:** Added `PreviousRefreshToken` and `PreviousRefreshTokenExpiryTime` to [`ApplicationUser.cs`](file:///d:/Projects/AspFiles/Showcase/Showcase.Infrastructure/Identity/ApplicationUser.cs) with a 45-second grace window in `IdentityService.UpdateRefreshTokenAsync`.
- **Database Migration:** Created [`20261004051500_AddRefreshTokenGracePeriod.cs`](file:///d:/Projects/AspFiles/Showcase/Showcase.Infrastructure/Migrations/20261004051500_AddRefreshTokenGracePeriod.cs).
- **Client Synchronization:** Integrated `BroadcastChannel("showcase_auth_sync")` in [`axiosClient.ts`](file:///d:/Projects/AspFiles/Showcase/Showcase.ClientApp/src/shared/api/axiosClient.ts) so multiple open tabs coordinate single refresh operations without token collisions.

### 3. Account Modifications Fresh Token Re-Issuance
- **Username & Password Changes:** Updated [`ChangeUsernameCommandHandler.cs`](file:///d:/Projects/AspFiles/Showcase/Showcase.Application/Features/Auth/Commands/ChangeUsername/ChangeUsernameCommandHandler.cs), [`ChangePasswordCommandHandler.cs`](file:///d:/Projects/AspFiles/Showcase/Showcase.Application/Features/Auth/Commands/ChangePassword/ChangePasswordCommandHandler.cs), [`ChangeUsername.cs`](file:///d:/Projects/AspFiles/Showcase/Showcase.Api/Endpoints/Auth/ChangeUsername.cs), and [`ChangePassword.cs`](file:///d:/Projects/AspFiles/Showcase/Showcase.Api/Endpoints/Auth/ChangePassword.cs) to generate new JWT tokens and append fresh cookies on success, keeping credentials and security stamps in sync.

### 4. Realtime & UX Enhancements
- **SignalR Auto-Recovery:** Updated [`useNotificationRealtime.ts`](file:///d:/Projects/AspFiles/Showcase/Showcase.ClientApp/src/features/notifications/hooks/useNotificationRealtime.ts) to trigger a silent refresh and re-authenticate if connection fails with a 401.
- **Session Expiry Notice:** Updated [`AuthContext.tsx`](file:///d:/Projects/AspFiles/Showcase/Showcase.ClientApp/src/shared/context/AuthContext.tsx) to display a clean toast notice when a session expires.

## Verification
- All 177 backend unit & feature tests passing (`dotnet test`).
- Clean client app build with zero TypeScript/Vite errors (`npm run build`).
