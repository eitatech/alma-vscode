# UI Inventory — gatomia-vscode

> Produced by the Reversa Visor on 2026-05-29 from user-supplied screenshots.
> Confidence: 🟢 CONFIRMED (visible + cross-checked vs `package.json`) · 🟡 INFERRED · 🔴 GAP.
> Granularity: `hybrid`. Screens map to the `providers` module (it owns the tree views); two map to nested units.

---

## Captured screens

| # | Screen / View | View id (`package.json`) | Container | State | Mapped unit | Screenshot |
|---|---------------|--------------------------|-----------|-------|-------------|------------|
| 1 | Specs (sidebar) | `gatomia.views.specExplorer` | activitybar `gatomia` | populated | `providers/spec-explorer-tree` | `gatomia-sidebar.png` (collapsed) + `spec-explorer-tree/screenshots/specs-tree-detail-{1,2}.png` (expanded) |
| 2 | Actions (SpecKit + Copilot assets) | `gatomia.views.actionsExplorer` | activitybar `gatomia` | populated | `providers` | `gatomia-sidebar.png` (collapsed) + `providers/screenshots/actions-view-expanded.png` (expanded) |
| 3 | Steering (Rules / Custom / User) | `gatomia.views.steeringExplorer` | activitybar `gatomia` | populated (git `M` badges) | `providers` (+ `steering`) | `gatomia-sidebar.png` + `providers/screenshots/steering-view-expanded.png` (expanded) |
| 4 | Repo Wiki (docs/ + architecture/) | `gatomia.views.wikiExplorer` | activitybar `gatomia` | populated | `providers` | `gatomia-sidebar.png` + `providers/screenshots/repo-wiki-view-expanded.png` (expanded) |
| 5 | Running Agents | `gatomia.views.runningAgents` | activitybar `gatomia` | New session / Active / Recent / Orphaned | `providers` (+ `agent-chat`) | `gatomia-sidebar.png` + `providers/screenshots/running-agents-view.png` |
| 6 | Cloud Agents | `gatomia.views.cloudAgents` | activitybar `gatomia` | empty + **populated** (T040 + open PR) | `cloud-agents` | `gatomia-sidebar.png` (empty) + `cloud-agents/screenshots/cloud-agents-view-populated.png` |
| 7 | Hooks | `gatomia.views.hooksExplorer` | activitybar `gatomia` | empty + **populated** (grouped by action type) | `providers/hooks-panel-crud` | `gatomia-sidebar.png` (empty) + `webview-hooks-view/screenshots/hooks-edit-with-logs.png` (populated) |
| 8 | Quick Access (Spec System / Configuration / Resources) | `gatomia.views.overview` | activitybar `gatomia` | populated | `providers` | `gatomia-sidebar.png` + `webview-welcome/screenshots/welcome-setup.png` (expanded) |
| 9 | Document Preview | — WebviewPanel `document-preview` | editor area | populated (Edit mode); renders `task` + `doc` (Mermaid) | `webview-preview/preview-lifecycle` | `document-preview-tasks-{1,2}.png` + `providers/screenshots/repo-wiki-view-expanded.png` (Overview doc) |
| 10 | Agent Chat | `gatomia.views.agentChat` | auxiliarybar `gatomia-chat` | new session + active transcript | `webview-agent-chat` | `webview-agent-chat/screenshots/agent-chat-{new-session,active-transcript}.png` |
| 11 | Cloud provider session (Devin Cloud) | — external (via "Open in Provider") | provider UI | running (T040, branch pushed) | `cloud-agents` | `cloud-agents/screenshots/devin-cloud-provider-session.png` |
| 12 | Welcome to GatomIA | — WebviewPanel `welcome-screen` | editor area | Setup / Features / Configuration / Status (Learn n/c) | `webview-welcome` | `webview-welcome/screenshots/welcome-{setup,features,configuration,status}.png` |
| 13 | Hooks form (create/edit) | — WebviewPanel `hooks` | editor area | create + edit; 4 action types + exec logs | `webview-hooks-view` | `webview-hooks-view/screenshots/hooks-create-{agent-command,git-operation,custom-agent,acp-agent}.png`, `hooks-edit-with-logs.png` |
| 14 | Orchestration (MAESTRO board) | `gatomia.views.orchestration` | activitybar `gatomia` (webview) | Board lanes + grouped + session detail | `webview-orchestration` | `webview-orchestration/screenshots/maestro-{board-lanes,board-grouped,session-detail}.png` |

> Screens 1–8 are sections of a single composite capture of the **GatomIA** activity-bar container (`providers/screens.md`). Screen 1 (Specs) and 5 (Running Agents) additionally have fully-expanded captures. Screen 6 (Cloud Agents) has empty + populated states (`cloud-agents/screens.md`). Screen 9 (Document Preview) is the markdown render panel (`webview-preview/screens.md`). Screen 10 (Agent Chat) is the spec-018 flagship panel (`webview-agent-chat/screens.md`). Screen 11 is the external Devin Cloud provider session reached via "Open in Provider". Screen 12 (Welcome to GatomIA) is the `webview-welcome` panel with 5 tabs; its Quick Access launcher equivalent is screen 8. Screen 13 (Hooks form) is the `webview-hooks-view` create/edit form with per-action-type fields; its tree equivalent is screen 7. Screen 14 (Orchestration / MAESTRO board) is the `webview-orchestration` lanes board (Running/Blocked/Ready) + session detail.

## Contributed views NOT yet captured 🔴

| View id | Name | Container | Notes |
|---------|------|-----------|-------|
| `gatomia.views.agentChatPrimary` | Agent Chat | activitybar `gatomia` | primary agent-chat tree (activitybar); not visible |

## Webview panels — partial states pending 🟡
- All major webview surfaces now have at least one capture. Remaining sub-states:
  - `webview-preview` — Source mode, refinement flow, interactive-form pending.
  - `webview-agent-chat` — queued follow-up, pending-write Accept/Reject gate, cloud read-only session pending.
  - `webview-welcome` — Learn tab maintainer-described 🟡 (no shot); unhealthy/missing-deps state pending.
  - `webview-hooks-view` — GitHub Tools / Custom Tools MCP-picker forms + populated logs pending.
  - `webview-orchestration` — board lanes + grouped + session detail ✅; List tab, Running/Blocked lanes with cards, **Workflow Composer** (React Flow) pending.
- Send screenshots of these to extend UI coverage.

---

## Coverage summary
- **Tree views captured:** 10 / 11 contributed views (91%); **Specs**, **Actions**, **Steering**, **Repo Wiki**, **Quick Access** fully expanded; **Running Agents**, **Cloud Agents**, **Hooks**, **Orchestration** detailed. Only `agentChatPrimary` (activitybar tree) remains.
- **Webview panels captured:** 5 (Document Preview; Agent Chat; Welcome; Hooks form; **Orchestration/MAESTRO**).
- **External provider UI captured:** 1 (Devin Cloud session via "Open in Provider").
- **Empty/populated states:** Cloud Agents (both), Hooks (both), Welcome (all-healthy).
- **Source screenshots:** 23 (1 sidebar + 2 Doc Preview/Specs-tree + 1 task crop + 1 Actions + 1 Steering + 1 Repo Wiki + 2 Agent Chat/Running Agents + 2 Cloud Agents/Devin Cloud + 4 Welcome tabs + 5 Hooks + 3 Orchestration/MAESTRO).
