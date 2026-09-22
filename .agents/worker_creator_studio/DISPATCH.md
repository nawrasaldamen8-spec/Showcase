## 2026-09-22T19:23:47Z

You are the Creator Studio Worker (creator_studio_agent).
Your Working Directory: d:\Projects\AspFiles\Showcase\.agents\worker_creator_studio
Client App Working Directory: d:\Projects\AspFiles\Showcase\Showcase.ClientApp

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

STRICT CONSTRAINT: DO NOT create or write unit test suites. Verification MUST be done via `npm run lint` and `npm run build` (tsc compilation and bundling).

READ THESE FIRST:
- d:\Projects\AspFiles\Showcase\.agents\ORIGINAL_REQUEST.md
- d:\Projects\AspFiles\Showcase\.agents\04_creator_studio_agent.agent
- d:\Projects\AspFiles\Showcase\DESIGN.md
- d:\Projects\AspFiles\Showcase\Showcase.ClientApp\TODO.md
- Existing primitives in `src/shared/components/` and layout in `src/shared/layout/`
- Existing types in `src/shared/types/index.ts` and API in `src/shared/api/`

YOUR TASKS:
1. Build Components in `src/features/posts/components/`:
   - `PostStatusBadge.tsx`: Pill badge for Draft, Published, Unpublished statuses matching Warm Gallery palette (Amber for Draft, Clay for Published, Stone for Unpublished).
   - `ImageDropzone.tsx`: Drag & drop or file picker zone simulating Cloudflare R2 direct ingestion with progress/delay indicator, validating image formats (JPEG, PNG, WebP) and sizes.
   - `ImageReorderGrid.tsx`: Visual preview grid of uploaded images showing thumbnail, display order numbers, move left/right (or up/down) reordering buttons, and delete button. Enforce invariant: if post is Published, prevent deleting the last image.
2. Build Creator Studio Dashboard (`src/features/posts/pages/StudioDashboardPage.tsx`):
   - Studio header with title "Creator Studio", creator greeting, and "+ New Post" Clay pill button.
   - Typographic status filter tabs (`All`, `Published`, `Drafts`) with active 1px underline.
   - Post list/grid displaying thumbnail, title, status badge (`PostStatusBadge`), date, image count, and actions ("Edit" button, "Publish/Unpublish" quick toggle, "Delete" button with confirmation modal).
   - Enforce publishing invariant: quick publish validates that the post has >= 1 image before publishing.
   - Empty state when no posts exist in selected tab with CTA to create a new post.
3. Build Post Editor Page (`src/features/posts/pages/PostEditorPage.tsx`):
   - Handles both creation (`/posts/new`) and editing (`/posts/:id/edit`).
   - Fields: Title input, Description multiline textarea (Anthropic Serif text), optional External Project URL.
   - Integrated `ImageDropzone` and `ImageReorderGrid` allowing adding images, reordering them, and removing images.
   - Action controls: "Save as Draft" (Slate pill button) and "Publish Work" (Clay pill button).
   - STRICT INVARIANT: "Publish Work" MUST enforce that at least 1 image is uploaded (>= 1). If no images are present, display clear inline error message and prevent publishing.
   - Optimistic state updates and toast notification on save/publish, with redirect to Studio or Post Details.
4. Export pages and components cleanly:
   - Update `src/features/posts/pages/index.ts` (export `StudioDashboardPage`, `PostEditorPage`, and preserve `PostDetailsPage`).
   - Create `src/features/posts/components/index.ts`.
   - Update `src/features/posts/index.ts`.
5. Update `TODO.md` in `Showcase.ClientApp` for Phase 3 items as you complete them.
6. Verification:
   - Run `npm run lint` and `npm run build` in `Showcase.ClientApp`.
   - Must complete with 0 errors.
   - ZERO unit test files.
7. Write full handoff report to `d:\Projects\AspFiles\Showcase\.agents\worker_creator_studio\handoff.md`.
8. Send a message to parent notifying completion.
