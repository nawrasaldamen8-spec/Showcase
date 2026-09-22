# Original User Request

## 2026-09-22T18:53:58Z

Build a complete, production-grade, editorial portfolio web frontend for the Showcase Portfolio Platform in English using React 19, TypeScript, Vite, Tailwind CSS v4, and React Router v7. The app runs completely standalone with an in-memory & LocalStorage Mock API Layer so the user can interactively test, preview, and review every feature before connecting to the live ASP.NET Core backend.

Working directory: d:/Projects/AspFiles/Showcase/Showcase.ClientApp
Integrity mode: development

## Requirements

### R1. Language & Editorial Design System
The entire application interface must be in **English (US)**. Implement the "Warm Gallery (Anthropic × VSCO)" aesthetic from `DESIGN.md`. Canvas uses ivory `#f0eee6`, cards `#faf9f5`, pill buttons (999px) with Clay accent `#d97757` or Slate `#141413`. ZERO box shadows across all components. Strictly adhere to the semantic composition rule: group elements organically and avoid arbitrary dividing boxes or card segmentations.

### R2. Core API Client & Mock State Engine
Implement a pluggable API abstraction in `src/shared/api` matching the exact C# DTOs from `doc/Backend_Documentation.md`.
- Provide curated English seed data (photography, architecture, design projects, creator bios, social links).
- Persist state mutations in browser `localStorage` across page reloads.
- Include a Demo Switcher in the navigation to toggle between Visitor (Guest) and Creator personas.
- Simulate Cloudflare R2 direct image uploads with client-side delays and object URL previews.
- Ensure the API client can be switched to the live backend with a single flag (`USE_MOCK_API = false`).

### R3. Explore Feed & Public Showcase Features
Implement public discovery pages according to the UI extractor and page blueprint specifications:
- Public Explore page (`/` or `/explore`) with live search across titles/descriptions/tags, responsive grid, and pagination.
- Public Creator Profile (`/u/:username`) displaying artist avatar, full name, bio, ordered social links, and published works portfolio.
- Public Post Details (`/posts/:id`) featuring high-impact visual presentation, creator attribution, image gallery, and external links.

### R4. Creator Studio & Interactive Post Editor
Implement authenticated creator workspace using feature-based architecture (`src/features/posts`):
- My Posts dashboard (`/studio` or `/posts/mine`) with status filtering (All, Published, Drafts).
- Post creation and editor with metadata (title, description, external URL).
- Interactive multi-image upload dropzone with thumbnail previews, drag/click reordering, and removal.
- Publishing workflow enforcing the backend business invariant ($\ge 1$ image required).

### R5. Profile Management & Social Links Editor
Implement profile settings (`src/features/profile`):
- Edit profile details (first name, last name, bio up to 500 characters with counter).
- Interactive avatar upload and removal.
- Dynamic Social Links manager (add, edit, delete, reorder platforms and URLs).
- Account security simulation (change password, change email, change username) with realistic validation feedback.

### R6. Verification & Build Integrity (No Unit Tests)
As strictly requested, DO NOT write unit test suites. Verification must be performed by compiling TypeScript (`tsc -b`), ensuring lint checks pass without errors (`npm run lint`), and verifying Vite production build (`npm run build`).

## Acceptance Criteria

### Language & Tone
- [ ] 100% English user interface (labels, navigation, placeholders, error alerts, and demo copy).
- [ ] Editorial typography hierarchy: VSCO Gothic display headings paired with Anthropic Serif reading text.

### Standalone Interactive Experience
- [ ] Application runs fully offline/standalone on `npm run dev` without requiring PostgreSQL, ASP.NET Core, or Cloudflare R2.
- [ ] Rich English mock data provided with high-resolution photography and creative portfolio works.
- [ ] Mock Auth switcher allows toggling between visitor and creator effortlessly.
- [ ] Mutations persist in browser session / `localStorage`.

### Agent Team Documentation & Tracking
- [ ] Agent definition files created in `.agents/` directory with explicit roles and guardrails.
- [ ] Granular `TODO.md` tracker created in the client app directory.

### Verification & Delivery
- [ ] Zero unit test files created.
- [ ] `npm run build` succeeds with zero TypeScript and bundling errors.
- [ ] All pages (Explore, Post Detail, Creator Profile, Login, Register, Studio, Post Editor, Profile Settings) fully wired and functional.
