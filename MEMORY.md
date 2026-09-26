# Showcase Project Memory

## Current Architecture

- **Backend:** ASP.NET Core (Showcase.Api, Showcase.Application, Showcase.Domain, Showcase.Infrastructure)
- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, React Router v7 (`Showcase.ClientApp`)
- **API Strategy:** Frontend currently relies on an in-memory & `localStorage` Mock API layer to preview interactively before backend binding.

## Current State & Work Completed

- **Frontend Core:** Established base application shell, routing, and layout components.
- **Mock API Layer:** Pluggable Mock API created and functioning; mutations persist in browser session.
- **UX Audit Implementation:**
  - Built centralized `ToastProvider` for notifications.
  - Upgraded `PostEditorPage` (interactive Tag Pills, dirty-state protection with discard modal, and a publishing invariant check requiring >= 1 image).
  - Refined `PostDetailsPage` (reading width clamped to `max-w-[68ch]`, Escape key navigation, and updated breadcrumbs).
  - Configured `Navbar` with dynamic links based on persona (visitor vs. creator).
- **Explore Feed Redesign:** Converted ExplorePage into a Dynamic Bento Grid (Asymmetric Editorial Feed) with varied spans (hero 2x2, tall 1x2 portrait, wide 2x1 landscape, and classic 1x1 square) using pattern interleaving and CSS Grid `dense` packing. Removed header and search filters.
- **Adaptive Navigation System (VSCO Style):** Replaced top Navbar with a fixed left Sidebar (matte black #141413) on Desktop & iPad, and dual-tier mobile navigation (Mobile Top Bar with centered logo, left '+' quick-add button, and right notification bell; Mobile Bottom Nav with icon-only links and active dot indicators).
- **Visual Curation Studio:** Revamped StudioDashboardPage by removing the bulky hero greeting banner and introducing a compact action toolbar (live status filter tabs, integrated real-time search, sort selector, and embedded '+ New Post' button) with immediate plate visibility and reduced top whitespace.
- **Career Profile Visibility Controls:** Added independent visibility toggles for all 6 Career sections (Experience, Academics, Skills, Credentials, Languages, Achievements) both in Career Hub cards and section headers. Persisted in `localStorage` (`showcase_career_visibility`) and integrated into `PublicProfilePage` with dynamic editorial tabs and read-only exhibition cards.
- **Build Integrity:** TypeScript strict mode enabled (`verbatimModuleSyntax`). Build steps (`tsc -b && vite build`) are verified and pass without errors.
- **Version Control:** Pushed recent work to GitHub in 5 atomic, logical commits.

## Global Rules & Constraints (Strict)

- **Testing Policy:** Zero unit test files are to be created.
- **Design Immutability:** Never alter `DESIGN.md`.
- **Subagents Guardrail:** Do not launch subagents autonomously. Plan first, prepare, and wait for explicit permission.
- **Aesthetics & UI:** "Warm Gallery" look with NO box shadows (`shadow-none`).
- **Semantic Composition Rule:** _Do not create a section merely because a group of elements exists. Group elements according to their semantic and visual relationship. Prefer cohesive compositions over unnecessary page segmentation._

## Pending Tasks / Next Steps

- **Global Technical Rules:** Awaiting user approval to save the drafted technical learnings to the global `~/.gemini/GEMINI.md` file.
- **Next Phase:** Review and implement further frontend features or prepare for backend integration according to user's directive.
