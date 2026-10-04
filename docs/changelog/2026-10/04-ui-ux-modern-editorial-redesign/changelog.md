# UI/UX Modern Editorial Redesign & Responsive Architecture

## Overview
Comprehensive overhaul of the frontend UI/UX architecture to strictly align with `DESIGN.md` (Warm Gallery) and `modern-web-guidance`. Refactored authentication flows, split wizard steps (introducing a dedicated Tags step and Bio step), established holistic portfolio and career visibility on dashboard roots, and enhanced desktop vs. mobile ergonomics.

## Key Changes

### 1. Split Editorial Login (`features/auth/pages/LoginPage.tsx`)
- Desktop: Split 12-column grid. Left side presents large geometric Gothic display typography (54px), editorial platform philosophy, and Warm Gallery hallmarks. Right side hosts a focused, comfortable 420px card on `#faf9f5` Ivory Light.
- Mobile: Streamlined vertical stack placing inputs immediately in the viewport without excessive preamble.
- Accessibility & Ergonomics: Added show/hide password unmask toggle with `aria-label`, standard autocomplete semantics (`username`, `current-password`), and touch-friendly button targets (>= 46px).

### 2. 5-Step Project Creator Wizard (`features/posts`)
- Unbundled the congested Step 3 into two dedicated steps:
  - **Step 3 (Narrative)**: `WizardStepEditorial.tsx` focuses purely on curatorial statement with architectural prompts.
  - **Step 4 (Taxonomy & Tags)**: `WizardStepTags.tsx` (New) provides custom tag input (Enter/comma key support), selected tag pills with quick removal, and categorized architectural taxonomy suggestions (Typology, Materiality, Discipline).
  - **Step 5 (Review)**: `WizardStepReview.tsx` provides full plate inspection.
- Updated `usePostEditorSteps.ts`, `constants.ts`, and `PostEditorPage.tsx` to handle 5 steps.
- Updated `WizardStepper.tsx` and `WizardBottomBar.tsx` for responsive mobile layout (compact progress bar and fixed bottom thumb bar).

### 3. 5-Step Registration Wizard (`features/auth`)
- Created `BioStep.tsx` as a standalone step for curatorial statement and philosophy, complete with inspiration prompts and skip action.
- Streamlined `PersonalInfoStep.tsx` to focus purely on Full Name / Practice Title and Contact Email.
- Upgraded `StepIndicator.tsx` to be responsive, rendering full titles on desktop and a compact step status counter on mobile.

### 4. Studio Dashboard Pulse (`features/posts/pages/StudioDashboardPage.tsx`)
- Added top editorial header with live portfolio pulse metrics (Total Works, Published in Gallery, Drafts) and a persistent "New Exhibition" CTA, giving creators an instant holistic status of their catalog.

### 5. Career Hub Chronology (`features/career/pages/CareerHubPage.tsx`)
- Decluttered category cards by replacing verbose boilerplate with concise, purposeful descriptions.
- Added a holistic "Practice Chronology & Active Roles" section below the 6 category cards, listing recent roles with status badges and one-click edit shortcuts.
- Refactored `ExperienceForm.tsx` into a structured 3-phase layout with responsive 2-column grids on desktop and fluid mobile rows.

## Verification
- Built frontend via `npm run build`: `tsc -b && vite build` completed in 969ms with 0 errors.
- All new and existing routes and types fully verified.
