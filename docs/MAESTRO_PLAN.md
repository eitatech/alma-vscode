# Maestro Board - VS Code Extension

Port of the JetBrains Maestro Board to the VS Code extension as a `WebviewPanel`,
mirroring the existing Welcome screen pattern.

## Overview

The Maestro Board provides a Kanban-style view of spec-driven development tasks,
a Composer for starting new tasks, and a session list for tracking running agents.

## Architecture

```
src/
  features/maestro/
    types.ts              # MaestroTask, RunningCard, BoardColumn, BoardSpecStatus
    board-projection.ts   # columnFor() - maps task signals to Kanban column
    task-prompt.ts        # key() and text() - stable task keys and prompt generation
    session-aggregator.ts # Aggregates ACP + cloud sessions into RunningCards
  providers/
    maestro-provider.ts   # Aggregates data for the UI (specs, tasks, sessions)
  panels/
    maestro-panel.ts      # WebviewPanel lifecycle (singleton, message passing)
  types/
    maestro.ts            # Extension/webview message contracts
  extension.ts            # Registers gatomia.showMaestro command
  package.json            # Command contribution

ui/src/
  features/maestro/
    maestro-screen.tsx    # Main screen with tab switching
    stores/maestro-store.ts   # Zustand store for webview state
    components/
      kanban-board.tsx    # Board with 7 columns
      kanban-column.tsx   # Single column with cards
      task-card.tsx       # Task card with run buttons
      composer.tsx        # Free-form task starter
      session-list.tsx    # Session list with grouping
      session-row.tsx     # Single session row
      filter-bar.tsx      # Spec filter + group-by toggle
      tab-button.tsx      # Tab switch button
    maestro.css           # Board styles
  page-registry.tsx       # Routes "maestro" page to MaestroScreen
```

## Board Columns

| Column        | Icon          | Color  | Condition                                           |
|---------------|---------------|--------|-----------------------------------------------------|
| DRAFT         | edit          | muted  | Spec status is DRAFT                                |
| TO DO         | list-files    | amber  | Approved spec, task not started, no blockers        |
| IN PROGRESS   | execute       | blue   | Task has an active session                          |
| IN REVIEW     | search        | purple | Spec status is REVIEW                               |
| BLOCKED       | cancel        | red    | Open change request or failed session               |
| READY         | check         | teal   | Task done but spec not yet archived                 |
| DONE          | test-passed   | green  | Spec status is ARCHIVED                             |

## Column Projection Rules

Ported from `BoardProjection.kt`:

1. `DRAFT` spec -> DRAFT column (regardless of task signals)
2. `REVIEW` spec -> IN_REVIEW column
3. `ARCHIVED` spec -> DONE column
4. `CURRENT` or `REOPENED` spec -> evaluate task signals in priority order:
   - `done` -> READY
   - `hasActiveSession` -> IN_PROGRESS
   - `specHasOpenBlocker || hasFailedSession` -> BLOCKED
   - otherwise -> TODO

## Task Key Format

Ported from `TaskPrompt.kt`:

- Key: `"{specId}::{taskId}"` (or `"{specId}::{taskTitle}"` if taskId is blank)
- Separator: `"::"`
- Prompt: `"Implement task {taskId}: {title} (spec: {specTitle} — {phase})"`

## Message Contracts

### Extension -> Webview

- `maestro/state` - Full state update with `tasks`, `sessions`, `specs`, `activeSpec`, `groupBySpec`, `activeTab`
- `maestro/error` - Error notification

### Webview -> Extension

- `maestro/ready` - Webview initialized
- `maestro/refresh` - Manual refresh request
- `maestro/start-task` - Start a task (local ACP or cloud)
- `maestro/new-freeform-task` - Start a free-form prompt
- `maestro/filter-spec` - Filter by spec ID
- `maestro/toggle-group` - Toggle group-by-spec
- `maestro/switch-tab` - Switch active tab
- `maestro/open-external` - Open external URL

## Auto-Refresh

The panel auto-refreshes every 2.5 seconds to reflect `tasks.md` edits and live
session state, matching the JetBrains implementation.

## Data Sources

- **Specs**: `SpecSystemAdapter.listSpecs()` from `spec-kit-adapter.ts`
- **Tasks**: `parseTasksFromFile()` from `task-parser.ts`
- **Spec Status**: `getSpecState()` from `review-flow/state.ts`
- **ACP Sessions**: `AcpSessionManager` from `services/acp/acp-session-manager.ts`
- **Cloud Sessions**: `AgentSessionStorage` from `cloud-agents/agent-session-storage.ts`
- **Devin Sessions**: `DevinSessionManager` from `devin/devin-session-manager.ts`

## Acceptance Criteria

- `gatomia.showMaestro` opens the panel
- All seven Kanban columns render cards per `BoardProjection`
- Spec filter and group-by-spec work across Board, Composer, and List
- Local/cloud actions start the correct services and link sessions by `taskKey`
- Auto-refresh reflects changes without manual reload
- All checks and tests pass
