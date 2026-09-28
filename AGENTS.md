## Ten Commandments for Coding Agents

1. **Build the theory first.** Programming is building an understanding of the problem, not editing text. Restate the problem, goal, affected area, and expected outcome, and explain how the code maps to the real-world activity it models. Do not assume silently.

2. **Surface uncertainty; offer options.** If requirements are unclear, ask. If there are multiple valid interpretations, present two or three reasonable approaches and recommend the simplest sustainable one. If the request is risky, say so.

3. **Keep units small and cohesive.** One file = one purpose; one function = one job. Functions ≤50 lines, nesting ≤4. When a file mixes concerns or grows unwieldy, split by feature/domain — not by type. Cohesion beats line count. Refactor for human readability, not mechanical rule compliance: keep natural reading flow, preserve meaningful feature/domain boundaries, and avoid one-line wrappers or pass-through methods unless they clarify a real concept.

4. **Explore, plan, then delegate.** Read the relevant code before proposing changes. On structural questions, read the maps and entry points before the internals. Break work into verifiable steps, each with its own check. Hand each independent step to a fresh-context subagent and take results back as files, not context dumps.

5. **Keep changes surgical.** Touch only what the task requires. Match existing style and design intent — a patch that passes tests but fights the structure is a defect. Do not refactor, rename, reformat, or clean unrelated code.

6. **Reuse before reinventing; choose simplicity.** Search for existing utilities, patterns, and files in the repo first. Write the minimum code that correctly solves the problem. Avoid speculative features, generic abstractions, and unnecessary configurability.

7. **Fix root causes.** Do not hide errors, silence failures, add fake success paths, or patch symptoms. Find why the problem happens and fix that.

8. **Test before trusting.** For bugs, reproduce with a failing test first. For features, define expected behavior with tests. Follow: test fails → minimal fix → test passes.

9. **Verify before claiming done.** Run relevant tests, lint, type checks, build, and integration checks. Report exactly what was verified, and state plainly what you did not check. Cite the definition site, not a comment about it. Do not claim success without evidence, and do not assert anything you have not verified.

10. **Protect the system.** Consider side effects: data, APIs, permissions, migrations, caching, concurrency, security, and backward compatibility. Never hardcode secrets. Never run destructive deletion commands without explicit user confirmation.

## Response & Documentation Style

- Lead with the decision or answer. Then state the reason (why) in one short clause.
- Structure explanations in two layers: a short plain-language conclusion and next action first, then technical details, evidence, code paths, commands, and caveats below it.
- Keep prose tight: prefer keywords over sentences, cut anything obvious from context.
- The _what_ belongs in the code; the _why_ belongs in your response, commit message, or comment — written so the next reader can rebuild the reasoning without you.
- Comments: write only when the reasoning is not obvious from the code. One line is usually enough.
- Use terms non-developers can follow; explain a jargon term the first time it appears.

## Repository Rules

- Never use emojis.
- Use current documentation for external libraries, APIs, and syntax-sensitive work.
- For domain-specific code, do not guess. Verify business/domain context from current code, data, and behavior, then make the smallest accurate fix.
- Between unrelated tasks, clear context. Accumulated failed attempts poison the next attempt.
- Record the reasoning behind decisions — including alternatives you rejected — and multi-step progress under `docs/changelog/<YYYY-MM>/<DD-topic>/`, so a context reset, fresh session, or subagent can resume from it.
- Delegate independent work to fresh-context subagents; pass briefs and results as files, never by dumping output into the main context. Batch parallel reads in one turn.

## Code Navigation

- Use Serena for understanding and navigating the existing codebase when the required information can be obtained through semantic code navigation.
- Prefer Serena tools first for source-code exploration:
  - `get_symbols_overview`
  - `find_symbol`
  - `find_referencing_symbols`
  - other Serena tools when they provide more targeted context.

- Prefer semantic/symbol-level retrieval over reading complete source files.
- Do not read a whole file unless the task genuinely requires file-level context.
- Do not re-read a file already read in this session unless it changed or the previously retrieved context is insufficient.
- Before modifying shared symbols, use Serena to inspect their references and usages.
- Use Serena for renames and structural refactors rather than text-based replacement.
- When repository information can be obtained through Serena, do not rely on assumptions or model memory.

## External Documentation

- Use Context7 when working with external libraries, frameworks, APIs, configuration, or syntax-sensitive behavior.
- Prefer Context7's current documentation over model memory when relevant documentation is available.
- Do not guess library APIs, method signatures, configuration options, framework behavior, or version-specific syntax when Context7 can verify them.
- Use Context7 especially for React, TypeScript, React Router, TanStack Query, Tailwind CSS, Vite, Axios, .NET, ASP.NET Core, Entity Framework Core, MediatR, and FluentValidation.
- When using Context7, select the relevant library and version when available. Do not use generic or unrelated documentation when version-specific documentation exists.
- Do not call Context7 when the answer can be determined entirely from the existing repository and does not depend on external documentation.
- Treat repository code as the source of truth for project-specific behavior and Context7 as the source of truth for external library/framework behavior.

## Information Sources

Use the following source priority when investigating a task:

1. Existing repository and project behavior — use Serena first when the information can be obtained through code navigation or symbol-level retrieval.
2. Current external library/framework documentation — use Context7 when the information depends on external libraries, frameworks, APIs, configuration, or version-specific behavior.
3. Targeted direct file reads when Serena cannot provide sufficient context.
4. Model knowledge only when the required information cannot be verified through the available sources.

When a tool can verify a fact, prefer verification over assumption.

Do not fabricate or infer APIs, symbols, project conventions, or framework behavior when they can be inspected or verified.

## Browser Verification

- Use Chrome DevTools MCP when the task requires verifying actual browser/runtime behavior, including:
  - DOM and layout behavior
  - browser console errors
  - network requests and responses
  - routing/navigation behavior
  - screenshots or visual verification
  - runtime JavaScript errors
  - frontend performance

- Prefer Serena for understanding and navigating source code.
- Prefer Context7 for external library/framework documentation.
- Use Chrome DevTools only when browser-level verification adds value; do not use it for tasks that can be fully verified from source code.
- After frontend changes that affect runtime behavior or UI, use Chrome DevTools to verify the result when appropriate.
- Do not treat a screenshot or browser observation as a replacement for understanding the underlying source code.
