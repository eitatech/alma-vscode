# Screens — `webview-orchestration` (MAESTRO board)

> Produced by the Reversa Visor on 2026-05-29. Mapping confirmed by the maintainer.
> Confidence: 🟢 CONFIRMED (visible) · 🟡 INFERRED / host-chrome · 🔴 GAP.
> View: `gatomia.views.orchestration` ("Orchestration") + page `orchestration` (`OrchestrationFeature`), provider `src/providers/orchestration-view-provider.ts` (🟢). Spec 017 / MAESTRO (ADR-0015).
> Units: `orchestration-lanes` (the board), `workflow-composer` (composer), `unmounted-prototypes` (separate Kanban prototype).
> Source images: `maestro-board-lanes.png`, `maestro-board-grouped.png`, `maestro-session-detail.png`.
>
> **Host note (transparency):** the captures' window chrome shows a Windsurf / "Cognition Platform (Enterprise)" host and a "Devin Local" footer; per the maintainer the **board content itself is GatomIA's MAESTRO Orchestration surface**. Board content is documented 🟢; the surrounding workspace chrome (Spaces / All sessions / status bar) is 🟡 host-level.

---

## Screen A — Orchestration board (lanes) 🟢 (`maestro-board-lanes.png`)
- **View switch:** `Board` | `List` tabs. 🟢
- **Filters:** `Time is Any time` (×), `Archived is Exclude` (×), `+` add filter. 🟢
- **Top-right:** `Search sessions…` + `Display` dropdown. 🟢
- **Lanes (status columns):** **`Running` (0)**, **`Blocked` (0)**, **`Ready` (65)** — each with a status dot (running ○, blocked ⊘, ready ● green). Maps to the autonomous execution states (`orchestration` read-model / `tasks` `ExecutionState`). 🟢
- **Session cards** (in a lane): title + relative timestamp + optional badges — **cloud icon** (cloud session) and **branch/PR icon + count**. Examples: `T040: Validate full observability acceptance checklist in 'specs/001-observability-…'` (34m ago, cloud, 1), `Reversa Framework Orchestrator`, `Generate Codebase Knowledge Graph`, `Gatomia-migration`, `Visor: Interface Documentation from Screenshots`, `Plano viabilidade Kafka→SQS+SNS FIFO` (cloud). 🟢
- **Purpose:** aggregate agent sessions (local ACP + cloud) into Running/Blocked/Ready lanes — the read-model surface of `orchestration` (`aggregate-snapshot`). 🟡

## Screen B — Board grouped by space/feature 🟢 (`maestro-board-grouped.png`)
- Same board, with cards **grouped under headers** (spaces/features): e.g. `Cloud Agent Integration`, `Jira Integration Specification`, `Actuator Dynamic Configuration`. 🟢
- Cards include `Fixing Performance Test Failures`, `Cloud Agent Contextual Dispatch`, `Review Devin Integration`, `Update Devin Task Status`, `OpenAPI Tools Setup`, `API Governance Automation`, `Update Constitution for Python Migration`, etc. 🟢
- **Purpose:** organize many sessions by initiative; the grouping is the orchestration board's space/folder dimension. 🟡

## Screen C — Session detail 🟢 (`maestro-session-detail.png`)
- **Left:** session-management panel — `All sessions`, `New space`, `Add folder`, `Spaces` with the session list (the same sessions as the board cards). 🟡 (host/session-management chrome)
- **Main:** the selected session's content — a scrollable transcript with tool-call summaries, `Thoughts`, command output blocks (here showing `state.json` edits + a prior Visor reply), and the agent's rendered markdown. 🟢
- **Right rail:** `New session`, `Open file`, `View diffs`. 🟡
- **Composer:** `Ask anything (⌘L)` + send; footer `Devin Local`. 🟡
- **Purpose:** open a session from the board to inspect/continue it; this is the detail counterpart of a board card. 🟡

---

## States captured
- Board: **lanes** view (Running/Blocked/Ready, counts 0/0/65) + **grouped** view (by space/feature). 🟢
- Session detail (transcript + session list). 🟢
- Not captured: `List` tab layout, **Running**/**Blocked** lanes with cards, the **Workflow Composer** (`workflow-composer`, React Flow graph), card drag/drop, the `Display` options. 🔴

## Mapping notes
- Board lanes + cards = `orchestration-lanes`, fed by the `orchestration` read-model (`aggregate-snapshot`) over `agent-chat` + `cloud-agents` sessions and `tasks` execution states.
- The separate `KanbanBoard` component (`unmounted-prototypes`) is a different, importer-less prototype (Reviewer Q6, decided **ship & wire**); this live board is the lanes view, not that component. 🟡
- `workflow-composer` (React Flow) is a sibling surface not shown here. 🔴
