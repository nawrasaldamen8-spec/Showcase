# Showcase Portfolio Platform — Multi-Agent Engineering Team

This directory defines the 5 specialized autonomous agents configured to build the Showcase ClientApp.

## The Agent Team

| File                              | Agent Name               | Focus Area                   | Key Output                                                                  |
| --------------------------------- | ------------------------ | ---------------------------- | --------------------------------------------------------------------------- |
| `01_ui_foundation_agent.agent`    | `ui_foundation_agent`    | Design System & Shared UI    | Warm Gallery tokens, pill buttons, zero shadows, layout & demo switcher     |
| `02_mock_engine_agent.agent`      | `mock_engine_agent`      | Data Architecture & Mock API | TypeScript DTO mirrors, localStorage persistence, seed data, auth state     |
| `03_showcase_explore_agent.agent` | `showcase_explore_agent` | Public Discovery & Feeds     | Explore feed, Post Details view, Creator Public Profile (`/u/:username`)    |
| `04_creator_studio_agent.agent`   | `creator_studio_agent`   | Creator Workspace            | My Posts studio, post editor, image upload & reorder, publishing invariants |
| `05_profile_settings_agent.agent` | `profile_settings_agent` | Identity & Social Links      | Bio editor, avatar upload, dynamic social links manager, security settings  |

## Global Constraints & Directives

- **Language**: 100% English interface, clean typography, editorial style.
- **Design**: Anthropic × VSCO (Warm Gallery). Canvas `#f0eee6`, cards `#faf9f5`, Clay pill `#d97757`. NO box shadows.
- **Semantic Composition**: No unnecessary segmented cards; prioritize cohesive editorial flow.
- **Testing**: STRICTLY ZERO UNIT TESTS. Verification is done via TypeScript compilation (`tsc -b`) and `npm run build`.
- **Status**: Ready on Standby awaiting user start signal.
