# Codebase Analysis Report

## 1. Security Pages Patterns & Shared Layout Approach
- **Shared Layouts**: The `SecurityActionLayout` is effectively used across multiple security pages (`UpdateEmailPage`, `ActiveSessionsPage`, `ChangePasswordPage`, `DeleteAccountPage`). It standardizes the page header (title, subtitle, badge, and back link) and provides a consistent card container for forms.
- **Navigation Hub**: `SecurityHubPage` acts as the root directory for security settings, using `SecurityNavRow` for consistent navigation links with descriptive badges.
- **Error Handling**: Form submissions heavily rely on a `ProblemDetails` interface to capture API errors, which are then rendered consistently via the `ProblemAlert` component.
- **State Management**: Uses local component state for forms (`useState`) and API loading/submitting states. Data fetching is mostly done in `useEffect` on mount.

## 2. Shared Components API Design (Props, Variants)
- **Design Pattern**: Base components (`Button`, `Input`, `Badge`, `Skeleton`) implement consistent prop patterns using `variant` and `size` enums.
- **Props**: They support `leftIcon`/`rightIcon` for injectability and `fullWidth` for layout control. Standard HTML attributes are supported using `forwardRef` and `React.InputHTMLAttributes`/`ButtonHTMLAttributes`.
- **Accessibility**: ARIA labels, `aria-invalid`, and described-by attributes are properly implemented in components like `Input`. Uses `useId()` for generating unique accessiblity IDs.

## 3. Context Patterns (Split Files, Hooks)
- **Separation of Concerns**: The context implementation is cleanly divided into three parts:
  1. **Definition files** (e.g., `toastContextDef.ts`, `authContextDef.ts`) contain the TypeScript interfaces and the `createContext` call.
  2. **Provider files** (e.g., `ToastContext.tsx`, `AuthContext.tsx`) contain the state logic and supply the value to the Provider.
  3. **Hook files** (e.g., `useToast.ts`, `useAuth.ts`) provide typed custom hooks to consume the context.
- This pattern prevents circular dependencies and separates type definitions from implementation.

## 4. Config and Build Setup
- **Vite & Tailwind v4**: The project is using Vite 8 and Tailwind CSS v4. The Vite config uses the new `@tailwindcss/vite` plugin instead of PostCSS.
- **TypeScript**: The `tsconfig.json` and `tsconfig.app.json` reflect a modern setup (`target: es2023`, `moduleResolution: bundler`, `verbatimModuleSyntax: true`).
- **Missing Aliases**: There are no path aliases configured (e.g., `@/shared`), leading to deep relative imports (`../../../shared/components/...`).

## 5. Barrel Export Consistency
- **Inconsistencies**: There are inconsistencies in file extensions within barrel files (`index.ts`). For example, `src/features/security/index.ts` explicitly includes `.tsx` extensions, whereas `src/shared/components/index.ts` omits extensions entirely (`export * from './Button';`). With `verbatimModuleSyntax` and modern ESM resolution, omitted extensions can cause build issues depending on the Vite/Rollup config.
- **Empty Barrels**: `src/features/career/index.ts` is empty.

## 6. CSS / Styling Approach
- **Tailwind v4 Theme Variables**: `index.css` correctly uses the new v4 `@theme` directive to define variables (e.g., `--color-slate-dark`, `--font-gothic`).
- **Hardcoded Hex Values**: Despite having theme variables defined, the vast majority of components hardcode hex colors directly into Tailwind arbitrary values (e.g., `bg-[#faf9f5]`, `text-[#141413]`, `border-[#cccbc8]`). This completely defeats the purpose of the theme system, causing duplication and making dark mode or future theming impossible without a massive refactor.
- **Global Typography**: Some global typography classes (`.text-label`, `.text-body-sm`) are defined in standard CSS, but components mix these with raw Tailwind utility classes.

## 7. Missing Types or Scattered Type Definitions
- **Centralization vs. Co-location**: Most domain types are centralized in `src/shared/types/index.ts` or `src/shared/types/career.ts`. However, some feature-specific types are scattered (e.g., `features/explore/types.ts` only contains a simple `Category` array/type).
- **Incomplete Domain Models**: While forms and components use standard interfaces, things like `PostStatus` rely on manual normalizers within components (`PostStatusBadge.tsx`) rather than a centralized utility, and mock data types in `careerMockData.ts` duplicate some assumptions from `career.ts`.
