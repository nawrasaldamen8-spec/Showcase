# DISPATCH — 2026-09-22T18:57:19Z

## Task Assignment: UI Foundation & Design System Primitives
**Role:** UI Foundation Worker (implementer, qa)
**Working Directory:** `d:\Projects\AspFiles\Showcase\.agents\worker_ui_foundation`
**Client App Directory:** `d:\Projects\AspFiles\Showcase\Showcase.ClientApp`
**Parent ID:** `273020da-0667-4e1f-bec4-a6386225ca02`

### Deliverables:
1. `src/index.css`: Warm Gallery tokens, zero box-shadows, typography classes (text-label, text-body-sm, text-body-lg, text-subheading, text-heading, text-display).
2. Atomic Shared Primitives in `src/shared/components/`:
   - `Button.tsx` (Pill 999px, variants: clay, slate, outline, ghost; sizes: sm, md, lg; icon, disabled, loading)
   - `Input.tsx` (Minimalist editorial text input, flat stone border, error/helper text)
   - `Textarea.tsx` (Anthropic Serif text editing, auto-resize / rows, char count, error)
   - `Badge.tsx` (Pill metadata tags: slate, clay, stone, amber)
   - `Modal.tsx` (Accessible dialog, backdrop, tonal elevation, no shadows)
   - `Drawer.tsx` (Accessible slide-in drawer, tonal backdrop, no shadows)
   - `Skeleton.tsx` (Warm tonal loading placeholder matching `#f0eee6`/`#faf9f5`)
   - `index.ts` barrel export
3. Global Editorial Layout in `src/shared/layout/`:
   - `Navbar.tsx` (Sticky editorial top bar with SHOWCASE brand, Explore/Studio/Settings links, avatar menu, + New Post CTA, DemoSwitcher embed)
   - `DemoSwitcher.tsx` (Visitor vs Creator toggle pill widget with instant visual feedback)
   - `Footer.tsx` (Understated editorial footer, brand mark, curation statement, links)
   - `index.ts` barrel export
4. Verification:
   - `npm run lint` and `npm run build` with zero errors.
   - STRICT CONSTRAINT: ZERO unit test suites.
5. Handoff report and parent notification.
