## 2026-09-22T19:23:47Z
You are the Profile Settings Worker (profile_settings_agent).
Your Working Directory: d:\Projects\AspFiles\Showcase\.agents\worker_profile_settings
Client App Working Directory: d:\Projects\AspFiles\Showcase\Showcase.ClientApp

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

STRICT CONSTRAINT: DO NOT create or write unit test suites. Verification MUST be done via `npm run lint` and `npm run build` (tsc compilation and bundling).

READ THESE FIRST:
- d:\Projects\AspFiles\Showcase\.agents\ORIGINAL_REQUEST.md
- d:\Projects\AspFiles\Showcase\.agents\05_profile_settings_agent.agent
- d:\Projects\AspFiles\Showcase\DESIGN.md
- d:\Projects\AspFiles\Showcase\Showcase.ClientApp\TODO.md
- Existing primitives in `src/shared/components/` and layout in `src/shared/layout/`
- Existing types in `src/shared/types/index.ts` and API in `src/shared/api/`

YOUR TASKS:
1. Build Components in `src/features/profile/components/`:
   - `BioEditor.tsx`: First Name, Last Name inputs, and Bio textarea with live character counter (enforce max 500 characters, Anthropic Serif styling). Save action updating profile via `apiClient.updateProfile`.
   - `AvatarUploader.tsx`: Interactive circular avatar uploader with drag/click picker, preview, upload progress simulation via `apiClient.getAvatarUploadUrl` and `apiClient.updateAvatar`, plus delete avatar action.
   - `SocialLinksManager.tsx`: Dynamic social links manager supporting platforms (`GitHub`, `LinkedIn`, `Website`, `Behance`, `Dribbble`, `X`, `Instagram`, `Custom`). Add new link form with platform dropdown and URL input, inline edit, delete link, and reorder controls (move up/down) persisting via `apiClient.reorderSocialLinks`.
   - `AccountSecurityCard.tsx`: Simulated account security with clean sections:
     - Change Password form (current password, new password, confirm).
     - Change Email form (new email, current password).
     - Change Username form (new username 3-30 chars slug, current password).
     - Validation feedback alerts and toast confirmations conforming to RFC 7807 problem details style.
2. Build Profile Settings Page (`src/features/profile/pages/ProfileSettingsPage.tsx`):
   - Route target: `/settings`.
   - Editorial layout with typographic tabs: "Profile Details", "Social Links", "Account Security".
   - Seamlessly integrates `BioEditor`, `AvatarUploader`, `SocialLinksManager`, and `AccountSecurityCard`.
   - Loading skeleton state and save feedback toasts.
3. Export pages and components cleanly:
   - Update `src/features/profile/pages/index.ts` (export `ProfileSettingsPage`, and preserve `PublicProfilePage`).
   - Create `src/features/profile/components/index.ts`.
   - Update `src/features/profile/index.ts`.
4. Update `TODO.md` in `Showcase.ClientApp` for Phase 4 items as you complete them.
5. Verification:
   - Run `npm run lint` and `npm run build` in `Showcase.ClientApp`.
   - Must complete with 0 errors.
   - ZERO unit test files.
6. Write full handoff report to `d:\Projects\AspFiles\Showcase\.agents\worker_profile_settings\handoff.md`.
7. Send a message to parent notifying completion.
