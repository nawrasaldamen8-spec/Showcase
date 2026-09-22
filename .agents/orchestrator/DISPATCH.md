# DISPATCH

## 2026-09-22T18:54:36Z

### Task Assignment from Sentinel (parent: aa7df207-c9f8-488a-bb08-66e65f85d5e9)

Build a complete, production-grade, editorial portfolio web frontend for Showcase in English using React 19, TypeScript, Vite, Tailwind CSS v4, and React Router v7. The app runs completely standalone with an in-memory & LocalStorage Mock API Layer.

1. **R1. Language & Editorial Design System**: 100% English, "Warm Gallery" aesthetic (#f0eee6 canvas, #faf9f5 cards, 999px pill buttons with Clay #d97757 / Slate #141413, ZERO box shadows, semantic composition).
2. **R2. Core API Client & Mock State Engine**: Pluggable API abstraction in `src/shared/api` matching exact C# DTOs, rich English seed data, LocalStorage persistence, Demo Switcher, R2 direct upload simulation, pluggable `USE_MOCK_API = false` switch.
3. **R3. Explore Feed & Public Showcase Features**: Explore page (`/` or `/explore`) with live search/grid/pagination, Creator Profile (`/u/:username`), Post Details (`/posts/:id`).
4. **R4. Creator Studio & Interactive Post Editor**: Studio dashboard (`/studio` or `/posts/mine`) with status filtering, post editor with metadata, multi-image upload dropzone with reordering/removal, publishing invariant (>= 1 image).
5. **R5. Profile Management & Social Links Editor**: Profile settings (`src/features/profile`), avatar upload/remove, dynamic social links manager, account security simulation.
6. **R6. Verification & Build Integrity**: STRICT CONSTRAINT: DO NOT create or write unit test suites. Verification MUST be done via `npm run lint` and `npm run build` (tsc compilation and bundling).
