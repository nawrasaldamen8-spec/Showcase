# Layout & Responsive Mobile Polish Changelog

**Date:** 2026-10-04  
**Scope:** Client Application (`Showcase.ClientApp`) Layout, Responsive UX, Microcopy, and Navigation Polish.

## Summary of Completed Changes

### 1. Text & Microcopy Clean-up
- **Platform Name Standardization:** Replaced all legacy instances of `"Showcase"` with `"Pority"` across `useAuthQueries.ts`, `EditProfilePage.tsx`, `ReportProfileModal.tsx`, `ReportPostModal.tsx`, `AuthCardLayout.tsx`, `CareerAcademicsPage.tsx`, `FeedPage.tsx`, `FeaturedRequestPage.tsx`, `AccountBannedPage.tsx`, `BanUserModal.tsx`, `AdminFeaturedPage.tsx`, and `Footer.tsx`.
- **Microcopy Condensation:** Shortened empty state text and card helper descriptions to concise sentences (under 12 words) without redundant callout banners.
- **Wizard Review Simplification:** Removed duplicate instructional banners in `WizardStepReview.tsx` so the exhibition review focuses strictly on content preview.

### 2. Authentication & Onboarding Flows
- **Credentials Step 1:** Added the missing `Email Address` field as the first input on Step 1 alongside username and password, with validation wired in `useRegisterWizard.ts`. Removed the redundant duplicate email field from Step 2.
- **OAuth Copy:** Standardized Google sign-in copy across the platform to `"Continue with Google"`.
- **Step Indicator:** Added `pt-3 sm:pt-0` breathing space to avoid visual crowding on mobile devices.
- **Mobile Sign In:** Scaled down mobile hero typography to `text-2xl sm:text-5xl lg:text-6xl` and reduced form container padding so the card sits above the fold on mobile viewports.

### 3. Navigation & App Shell
- **Desktop Sidebar Restructuring & Menu Elimination:**
  - Placed **Admin Console** directly into the primary navigation list under `Profile` when the user has the Admin role (`user?.roles?.includes("Admin")`).
  - Reorganized the bottom action area: `+ NEW POST` primary button sits on top, with `ACCOUNT SETTINGS` (`/settings`) directly below it.
  - Replaced the settings gear icon in the user profile row with a direct, dedicated `Log Out` button (`LogOut` icon).
  - Completely eliminated the floating popup menu (`SidebarUserMenu` popover), providing immediate one-click visibility without nested submenus or click-outside overlays.
- **Breadcrumbs:** Removed redundant `← STUDIO` and `← FEED` breadcrumbs from top-level routes (`CareerHubPage`, `NotificationsPage`, `SecurityHubPage`, `PublicProfilePage`). Breadcrumbs now only appear when explicitly navigating from a sub-route or referrer state.
- **Mobile Header:** Removed the red logout button from `MobileTopBar` to prevent accidental logouts and align with platform security guidelines (logout is placed in Settings & Profile).
- **Studio Action Triggers:** Hidden top `+ NEW EXHIBITION` button on mobile viewports (`hidden sm:inline-flex`) to avoid duplicate triggers with the bottom navigation central FAB (`+`).

### 4. Project Studio & Media Management
- **Studio Post Cards:** Made cards and titles clickable, converted the primary action into a dedicated `Edit` button, and encapsulated secondary actions (`View Exhibition`, `Publish / Unpublish`, `Delete`) inside an accessible 3-dot dropdown menu.
- **Media Asset Grid:** Standardized plates to a consistent `4:3` ratio, added visual drag handles (`GripVertical`) with `cursor-grab`, and implemented real HTML5 drag-and-drop reordering with visual drop cues.
- **Curatorial Post Description:** Clamped exhibition description to the first 10 lines (`line-clamp-[10]`) in `PostCuratorialMeta.tsx`. The text is clickable to expand, accompanied by an explicit `Read more` / `Show less` toggle button with chevron indicators that only appears when description overflows 10 lines.
- **Lightbox Interactive Zoom & Pan:** Integrated interactive zoom controls into `Lightbox.tsx`:
  - Frosted glass toolbar pill with Zoom In (`+`), Zoom Out (`-`), percentage badge, and reset button.
  - Multi-input scaling: Mouse wheel, trackpad scroll, double-click toggle (1x / 2.5x), keyboard shortcuts (`+`, `-`, `0`), and mobile two-finger pinch-to-zoom.
  - Click & drag pan with boundary clamping when zoomed in (`scale > 1x`), while preserving slide swipe navigation at `scale = 1x`. Auto-resets zoom when switching slides.

### 5. Profile, Community & Dashboard Views
- **Profile Works Tab:** Restored original multi-column masonry gallery (`columns-2 sm:columns-3 lg:columns-4 [column-fill:_balance]`) with organic natural aspect ratios (`aspectRatio="auto"`), preserving vertical and horizontal plate dimensions without artificial cropping and maintaining the compact 2-column mobile experience.
- **Save Profile Action:** Updated the Save Profile button in `BioEditor.tsx` to display active `clay` accent with clear contrast when `hasChanges` is true, switching to an outline state when clean.
- **Community Directory:** Repositioned the specialty badge under creator handles in `MemberProfileCard.tsx` to prevent premature truncation (`N...` / `@naw...`) of user names.
- **Notifications Screen:** Added an explicit hover delete button for desktop users while maintaining touch swipe-to-delete for mobile devices.
- **Session Management & Mobile Logout:** Added a dedicated "Session Management" section at the bottom of `SecurityHubPage.tsx` (`/settings/security`) featuring an explicit `Log Out` button with a confirmation modal, giving mobile and desktop users an accessible and secure way to sign out of their account.
- **Dashboard Footer:** Conditionally hid the 200px marketing footer in `AppLayout.tsx` for workspace routes (`/studio`, `/settings`, `/career`, `/notifications`, and post editors), keeping authenticated dashboards clean and content-focused.

## Verification
- Clean TypeScript and Vite compilation (`npm run build`) with zero errors.
