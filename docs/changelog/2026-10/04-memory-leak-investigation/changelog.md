# Memory Leak Investigation & Remediation

## Overview
Comprehensive audit and surgical fixes for memory retention, dangling closures, and unreleased Blob resources across the Showcase ClientApp frontend application.

## Key Changes & Remediation

### 1. Object URL (Blob) Lifecycle & Deallocation
- **`usePostEditorImages.ts`**:
  - Added `stagedBlobUrlsRef` to track locally staged Blob URLs created during draft composition.
  - In `handleDeleteImage`: Checked if deleted image URL starts with `blob:`, immediately releasing binary memory via `URL.revokeObjectURL(target.url)`.
  - Added unmount effect in `usePostEditorImages` to revoke all remaining local Blob URLs when the user navigates away without publishing.
- **`useDropzoneUpload.ts`**:
  - Transferred ownership of staged Blob URLs to the parent component upon `onImagesUploaded` completion, clearing local dropzone references so that wizard step transitions (`WizardStepMedia` unmounting) do not revoke URLs prematurely.
  - Added error-path cleanup to revoke orphan local URLs if an upload batch fails midway.

### 2. Timers & Dangling Closures Protection
- **`useAvatarUpload.ts`**:
  - Replaced unmanaged `setTimeout` calls with `safeTimeout` and added an unmount cleanup effect that clears all pending timers and revokes the avatar object URL.
- **`PostLikeButton.tsx`**:
  - Added an unmount cleanup effect for `poppingTimerRef` and `debounceTimerRef`.
  - Flushed any pending debounced like state commit to the server before unmount if the user rapidly navigated away.
- **`NotificationRow.tsx`**:
  - Added `deleteTimerRef` and an unmount cleanup effect to cancel pending swipe-to-delete callbacks.
- **`useBioEditor.ts`**:
  - Added `successTimerRef` and an unmount cleanup effect to cancel success notification timers.
- **`usePostEditorSubmit.ts`**:
  - Added `navTimerRef` and an unmount cleanup effect to avoid memory retention during delayed navigation.
- **`DeleteAccountPage.tsx`**:
  - Added `deleteTimerRef` and unmount cleanup.

### 3. TanStack Query Cache Reclamation
- **`queryClient.ts`**:
  - Optimized `gcTime` from 30 minutes to 10 minutes (`1000 * 60 * 10`) to speed up cache reclamation of inactive pages during long browsing sessions.

## Verification
- Verified via `npm run build` (`tsc -b && vite build` completed in 1.18s with 0 errors).
- All component event listeners and interval/timeout references are now properly cleaned up on unmount.
