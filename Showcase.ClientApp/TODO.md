# Showcase ClientApp — Implementation TODO List

> **Project Architecture:** Feature-based modular structure (`src/features/*`, `src/shared/*`)
> **Theme:** Warm Gallery (Anthropic × VSCO)
> **Language:** English (US)
> **Mode:** Interactive Mock Sandbox with LocalStorage Persistence
> **Testing Directive:** NO Unit Tests. Verified via `tsc -b` and `npm run build`.

---

## Phase 1: Foundation & Shared Infrastructure (`ui_foundation_agent` & `mock_engine_agent`)

- [x] **1.1 Tokens & Tailwind Configuration**
  - [x] Verify `--color-ivory-medium` (`#f0eee6`), `--color-ivory-light` (`#faf9f5`), `--color-slate-dark` (`#141413`), and `--color-clay` (`#d97757`) in `index.css`.
  - [x] Enforce zero box-shadow rule globally.
  - [x] Establish VSCO Gothic display styles and Anthropic Serif editorial reading styles.

- [x] **1.2 Atomic Shared Primitives (`src/shared/components`)**
  - [x] `Button.tsx` (Pill shape 999px: Clay primary, Slate secondary, Outline, Ghost).
  - [x] `Input.tsx` (Flat warm border, editorial text styling).
  - [x] `Textarea.tsx` (Serif body text support).
  - [x] `Badge.tsx` (Pill metadata tags).
  - [x] `Modal.tsx` & `Drawer.tsx` (Smooth overlay without harsh shadows).
  - [x] `Skeleton.tsx` (Tonal loading placeholders).

- [x] **1.3 Global Editorial Layout (`src/shared/layout`)**
  - [x] `Navbar.tsx` (Sticky editorial top-bar with brand mark, navigation tabs, and "+ New Post" CTA).
  - [x] `DemoSwitcher.tsx` (Toggle between Visitor/Guest and Creator modes with instant preview).
  - [x] `Footer.tsx` (Understated editorial footer).

- [x] **1.4 TypeScript Contracts & Types (`src/shared/types`)**
  - [x] Mirror C# DTOs: `Profile`, `SocialLink`, `Post`, `PostImage`, `PostStatus`, `UserIdentityDetails`.
  - [x] ProblemDetails error types conforming to RFC 7807.

- [x] **1.5 Mock API Engine & LocalStorage Sandbox (`src/shared/api`)**
  - [x] `mockData.ts` (High-quality photography, architecture, and UI/UX seed projects with Unsplash imagery).
  - [x] `mockService.ts` (Stateful CRUD operations persisting in browser `localStorage`).
  - [x] Direct R2 upload simulation with client-side delay and `URL.createObjectURL` preview.
  - [x] `AuthContext.tsx` (Mock authentication state provider).

---

## Phase 2: Public Showcase & Explore Feed (`showcase_explore_agent`)

- [x] **2.1 Explore Page (`/` or `/explore`)**
  - [x] Large typographic headline: "Curated Visual Showcase".
  - [x] Live real-time search input filtering across titles, descriptions, and categories.
  - [x] Cohesive editorial grid displaying published works (no arbitrary enclosing boxes).
  - [x] Responsive pagination / infinite flow.

- [x] **2.2 Post Details Page (`/posts/:id`)**
  - [x] High-impact edge-to-edge photography hero.
  - [x] Asymmetric layout: editorial description in Anthropic Serif, external project link ("Live Project" / "GitHub").
  - [x] Secondary image gallery stack / carousel.
  - [x] Creator info sidebar with direct link to creator public profile.

- [x] **2.3 Public Creator Profile Page (`/u/:username`)**
  - [x] Creator header: large circular avatar, full name, username badge, editorial bio.
  - [x] Ordered social links with external arrow indicators (`GitHub`, `LinkedIn`, `Website`, `Behance`).
  - [x] Published works portfolio grid (drafts and private works hidden).

---

## Phase 3: Creator Studio & Post Management (`creator_studio_agent`)

- [x] **3.1 Studio Dashboard (`/studio` or `/posts/mine`)**
  - [x] Overview of user's posts with status tabs: `All`, `Published`, `Drafts`.
  - [x] Post list with thumbnail, title, status badge, date, image count, and quick actions.
  - [x] Quick "Publish" / "Unpublish" toggle.
  - [x] Delete action with confirmation.

- [x] **3.2 Post Editor (`/posts/new` & `/posts/:id/edit`)**
  - [x] Title input, multiline description textarea, optional external URL.
  - [x] Drag-and-drop image upload dropzone simulating Cloudflare R2 presigned upload.
  - [x] Thumbnail preview grid with remove action and visual reordering indicators.
  - [x] Publication invariant validation (requires $\ge 1$ uploaded image).
  - [x] Optimistic state update and toast notification.

---

## Phase 4: Creator Profile & Settings (`profile_settings_agent`)

- [x] **4.1 Profile Details Editor**
  - [x] First Name & Last Name inputs.
  - [x] Bio editor with live character counter (enforce max 500 characters).
  - [x] Avatar upload dropzone with immediate preview and delete option.

- [x] **4.2 Dynamic Social Links Manager**
  - [x] Add new social platform link (dropdown for Platform, input for URL).
  - [x] Inline editing and deletion of existing links.
  - [x] Reordering capability (up/down order persistence).

- [x] **4.3 Account Security Settings**
  - [x] Change Password form (current password, new password, confirm).
  - [x] Change Email form (new email, current password).
  - [x] Change Username form (new username, current password).
  - [x] Realistic feedback alerts for successful changes or validation errors.

---

## Phase 5: Routing, Verification & Polish

- [x] **5.1 App Router Setup (`src/App.tsx`)**
  - [x] Route map: `/explore`, `/posts/:id`, `/u/:username`, `/studio`, `/posts/new`, `/posts/:id/edit`, `/settings`.
  - [x] 404 Not Found editorial view.
- [x] **5.2 Verification (No Unit Tests)**
  - [x] Run `tsc -b` to guarantee zero TypeScript compiler errors.
  - [x] Run `npm run lint` to guarantee clean ESLint standards.
  - [x] Run `npm run build` to confirm flawless Vite production bundle.
- [x] **5.3 Developer Handoff**
  - [x] Document the single switch (`USE_MOCK_API = false`) for future ASP.NET Core backend connection.
