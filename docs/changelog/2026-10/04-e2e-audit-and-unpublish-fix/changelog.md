# E2E Testing, Broadcasts Route Removal & Studio Unpublish Logic Fix

## Overview
Completed comprehensive End-to-End testing via Chrome DevTools MCP across guest, creator (`nawras`), and admin (`admin`) roles. Removed obsolete broadcasts route/components as directed, and fixed a logical defect where clicking "Unpublish" on a published post inadvertently dispatched a "publish" command.

## Key Changes

### 1. Studio Post Unpublish Fix
- **File**: `Showcase.ClientApp/src/features/posts/hooks/usePostActions.ts`
- **Issue**: `const isCurrentlyPublished = Number(post.status) === PostStatus.Published;` evaluated to `false` because `post.status` is a string (`"Published"`), and `Number("Published")` yields `NaN`. This caused the handler to always enter the publish branch.
- **Fix**: Replaced with `isPostPublished(post.status)` from `features/posts/utils.ts` which robustly handles string and numeric enums. Added query cache invalidation for `queryKeys.posts.all` on unpublishing.

### 2. Removal of Obsolete Broadcasts Module
- **Files Deleted**:
  - `Showcase.ClientApp/src/features/admin/pages/AdminBroadcastsPage.tsx`
  - `Showcase.ClientApp/src/features/admin/components/BroadcastComposeModal.tsx`
- **Files Updated**:
  - `Showcase.ClientApp/src/app/App.tsx`: Removed lazy import and `<Route path="broadcasts" ... />`.
  - `Showcase.ClientApp/src/features/admin/index.ts`: Removed exports for `AdminBroadcastsPage` and `BroadcastComposeModal`.

### 3. Guest Interaction Protection (Likes & Reports)
- **Files**:
  - `Showcase.ClientApp/src/features/posts/components/PostLikeButton.tsx`: Added `useAuth` and `useToast` checks to prevent unauthenticated users from sending unauthorized like requests, displaying a friendly `"Please sign in to like this project."` toast and avoiding unhandled 401 console errors.
  - `Showcase.ClientApp/src/features/posts/components/PostCuratorialMeta.tsx`: Guarded the report button with `currentUser` check and toast `"Please sign in to report content."`.
  - `Showcase.ClientApp/src/features/profile/components/ProfileHeader.tsx`: Guarded the profile report menu action with `currentUser` check and toast `"Please sign in to report profiles."`.

## Verification
- Built frontend cleanly: `npm run build` (`tsc -b && vite build` built in 2.39s with 0 errors).
- Live interactive testing in Chrome DevTools MCP confirmed:
  1. Clicking "Unpublish" on post `233` transitions its state to `UNPUBLISHED` on both backend and frontend, updates tab counters (`PUBLISHED(0)`, `DRAFTS(1)`), and displays the "Publish" button.
  2. Clicking "Publish" transitions it cleanly back to `PUBLISHED` (`ALL(1)`, `PUBLISHED(1)`).
  3. Clicking the Like button as an anonymous guest displays `"Please sign in to like this project."` toast without optimistic state change or 401 console error.
  4. Clicking Report as an anonymous guest displays `"Please sign in to report content."` toast without opening the report modal.
  5. Admin console routes operate cleanly with obsolete Broadcasts route safely returning 404.
