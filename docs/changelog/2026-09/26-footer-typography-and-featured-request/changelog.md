# Changelog: Footer Typography Redesign & Featured Suggestions Request

## 1. Overview
Implemented the footer redesign with large bold statement typography for "Pority" (without emblem icon), streamlined mobile top bar branding, centered the footer typography and copyright notice, and created the dedicated "Featured Suggestions Request" (تقديم طلب العرض في الاقتراحات) page in Account Settings.

## 2. Changes Implemented

### A. Footer Typography & Layout
- Removed duplicate "Pority" heading above the brand statement in the top-left section.
- Centered the giant bold statement typography for `Pority` across the screen (`text-center` with `flex justify-center`).
- Centered the copyright statement (`© 2026 Pority. All rights reserved.`) horizontally at the bottom bar.
- Platform links remain neatly aligned on the right.
- File modified: `src/shared/layout/Footer.tsx`.

### B. Mobile Navigation
- Updated `MobileTopBar.tsx` to display only the clean text wordmark `Pority` without the vector emblem icon.
- File modified: `src/shared/layout/MobileTopBar.tsx`.

### C. Featured Suggestions Request (`/settings/security/featured`)
- Added `FeaturedRequestDto` and `featuredStatus` across `security.ts` and `profile.ts` types.
- Implemented `submitFeaturedRequest` in `mockService.profile.ts` and `apiClient.profile.ts`.
- Created dedicated `FeaturedRequestPage.tsx` with:
  - Security action layout with breadcrumb back to `/settings/security`.
  - Status banners for Featured, Pending, and None states.
  - Simplified submission form containing single message textarea and submit action.
- Added navigation rows in `SecurityHubPage.tsx` and `SecuritySettingsTab.tsx`.
- Registered route `/settings/security/featured` in `App.tsx`.

## 3. Verification
- `npm run lint`: Passed with 0 errors.
- `npm run build`: TypeScript (`tsc -b`) and Vite production build passed successfully.
